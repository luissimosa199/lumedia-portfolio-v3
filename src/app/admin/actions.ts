"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  endAdminSession,
  getAdminCredentialDiagnostics,
  requireAdmin,
  startAdminSession,
  verifyAdminPassword,
} from "@/lib/adminAuth";
import { logger, serializeError } from "@/lib/logger";
import {
  createProject,
  deleteProject,
  isProjectId,
  isSlugTaken,
  moveProject,
  updateProject,
} from "@/lib/adminProjects";
import { parseProjectForm, type ProjectFieldErrors } from "./projectForm";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _previous: LoginState,
  formData: FormData
): Promise<LoginState> {
  const attemptId = randomUUID();
  const credential = getAdminCredentialDiagnostics();
  logger.info("admin.login.attempt", {
    attempt_id: attemptId,
    configured: credential.configured,
    credential_source: credential.source,
    hash_format_valid: credential.hashFormatValid,
    hash_length: credential.hashLength,
  });

  if (!credential.configured) {
    logger.warn("admin.login.rejected", {
      attempt_id: attemptId,
      reason: "not_configured",
    });
    return { error: "Admin login is not configured on this server." };
  }

  const password = formData.get("password");
  if (typeof password !== "string") {
    logger.warn("admin.login.rejected", {
      attempt_id: attemptId,
      reason: "missing_password",
    });
    return { error: "Wrong password." };
  }

  let valid = false;
  try {
    valid = await verifyAdminPassword(password);
  } catch (error) {
    logger.error("admin.login.verification_error", {
      attempt_id: attemptId,
      error: serializeError(error),
    });
    return { error: "Admin login is temporarily unavailable." };
  }

  if (!valid) {
    logger.warn("admin.login.rejected", {
      attempt_id: attemptId,
      reason: "invalid_password",
    });
    return { error: "Wrong password." };
  }

  try {
    await startAdminSession();
  } catch (error) {
    logger.error("admin.login.session_error", {
      attempt_id: attemptId,
      error: serializeError(error),
    });
    return { error: "Admin login is temporarily unavailable." };
  }

  logger.info("admin.login.success", { attempt_id: attemptId });
  redirect(ADMIN_HOME_PATH);
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect(ADMIN_LOGIN_PATH);
}

/**
 * Every public page reads projects at request/build time; purge the whole
 * tree so the home, /projects, and every /projects/[slug] in both locales
 * pick up the change immediately.
 */
function revalidateSite() {
  revalidatePath("/", "layout");
}

export interface SaveProjectState {
  error?: string;
  errors?: ProjectFieldErrors;
}

export async function saveProjectAction(
  _previous: SaveProjectState,
  formData: FormData
): Promise<SaveProjectState> {
  await requireAdmin();

  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" && idRaw ? idRaw : null;
  if (id && !isProjectId(id)) {
    return { error: "Invalid project id." };
  }

  const { input, errors } = parseProjectForm(formData);
  if (!errors.slug && (await isSlugTaken(input.slug, id ?? undefined))) {
    errors.slug = "Another project already uses this slug.";
  }
  if (Object.keys(errors).length > 0) {
    return { error: "Please fix the highlighted fields.", errors };
  }

  try {
    if (id) {
      const updated = await updateProject(id, input);
      if (!updated) return { error: "Project not found." };
    } else {
      await createProject(input);
    }
  } catch (error) {
    logger.error("admin.project.save_error", {
      project_id: id,
      slug: input.slug,
      error: serializeError(error),
    });
    return {
      error:
        error instanceof Error
          ? `Could not save project: ${error.message}`
          : "Could not save project.",
    };
  }

  revalidateSite();
  redirect(`${ADMIN_HOME_PATH}?saved=${encodeURIComponent(input.slug)}`);
}

export async function deleteProjectAction(id: string): Promise<void> {
  await requireAdmin();
  try {
    await deleteProject(id);
    logger.info("admin.project.deleted", { project_id: id });
  } catch (error) {
    logger.error("admin.project.delete_error", {
      project_id: id,
      error: serializeError(error),
    });
    throw error;
  }
  revalidateSite();
  redirect(`${ADMIN_HOME_PATH}?deleted=1`);
}

export async function moveProjectAction(
  id: string,
  direction: "up" | "down"
): Promise<void> {
  await requireAdmin();
  try {
    await moveProject(id, direction);
    logger.info("admin.project.reordered", { project_id: id, direction });
  } catch (error) {
    logger.error("admin.project.reorder_error", {
      project_id: id,
      direction,
      error: serializeError(error),
    });
    throw error;
  }
  revalidateSite();
}

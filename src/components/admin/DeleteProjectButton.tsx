"use client";

import { deleteProjectAction } from "@/app/admin/actions";
import { dangerButtonClass } from "./styles";

const DeleteProjectButton = ({ id, slug }: { id: string; slug: string }) => {
  return (
    <form
      action={deleteProjectAction.bind(null, id)}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${slug}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className={dangerButtonClass}>
        Delete
      </button>
    </form>
  );
};

export default DeleteProjectButton;

-- Seeds project_translations / project_image_translations for both
-- locales, all 6 projects. Idempotent (ON CONFLICT DO UPDATE), matches
-- the current single source of truth for each locale:
--
--   es -> pulled live from projects.name/subtitle/body and
--         project_images.caption (the current base-column content,
--         which was the site's only content before localization).
--   en -> literal, copied from src/i18n/messages/en.json's now-removed
--         "projectContent" overlay (the already-authored, verified
--         English translations).
--
-- Run this AFTER 0001_create_project_translations.sql. Safe to re-run.

-- Spanish (es): project name/subtitle/body, read straight from the
-- live base columns so this stays correct even if that content changes
-- before the seed runs.
INSERT INTO project_translations (project_id, locale, name, subtitle, body, updated_at)
SELECT id, 'es', name, subtitle, body, now()
FROM projects
ON CONFLICT (project_id, locale) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  body = EXCLUDED.body,
  updated_at = now();

-- Spanish (es): gallery image captions, read straight from the live
-- project_images.caption column.
INSERT INTO project_image_translations (project_id, idx, locale, caption, updated_at)
SELECT project_id, idx, 'es', caption, now()
FROM project_images
ON CONFLICT (project_id, idx, locale) DO UPDATE SET
  caption = EXCLUDED.caption,
  updated_at = now();

-- English (en): project name/subtitle/body, literal from en.json's
-- projectContent overlay, matched onto each project by slug.
INSERT INTO project_translations (project_id, locale, name, subtitle, body, updated_at)
SELECT p.id, 'en', v.name, v.subtitle, v.body, now()
FROM projects p
JOIN (VALUES
  ('ticker-scanner',
   'Ticker Scanner',
   'NestJS REST API with 52% test coverage, Cencosud invoice scraping, and a paperless future in mind.',
   'Ticker Scanner is my personal Next.js project, with solid 52% test coverage, focused on scraping invoices from Cencosud supermarkets (Día, Jumbo, Vea, Easy). Its long-term vision is to pave the way toward a paperless future where transaction information is managed efficiently and sustainably. With secure authentication and a MongoDB database, this backend provides a practical solution for organizing and analyzing invoice data while moving toward a greener, more efficient paperless experience.'),
  ('lumedia-blog',
   'Lumedia Blog',
   'A simple, elegant blog with useful notes about Next.js, Nginx, and Docker to simplify everyday processes.',
   'Welcome to my practical blog, where you will find straightforward tips about Next.js, Nginx, and Docker. No unnecessary detours, just useful information to simplify your processes. Explore and simplify!'),
  ('portafolio',
   'Portfolio',
   'Minimalist portfolio with a dual design, dark and light themes, and appealing icons.',
   'Discover my minimalist portfolio with a dual design that adapts to your preferences, whether you choose a dark or light theme. Explore easily and find relevant information about my projects and skills. The appealing icons add a special touch, making the experience both visually pleasant and informative. Welcome to my space!'),
  ('gbooks',
   'Gbooks',
   'GBooks: a search engine for historical, public-domain books using the Google Books API.',
   'GBooks is my personal project dedicated to simplifying the search for and download of historical books and public-domain documents. Using the Google Books API, this search engine offers an easy and quick way to access valuable works from the past. Explore history and culture through this tool, designed to make yesterday''s wisdom easier to reach. Discover and download knowledge without restrictions!'),
  ('ticker-scanner-web',
   'Ticker Scanner WEB',
   'Web application for analyzing and storing your supermarket invoice information.',
   'Ticker Scanner is built with Next.js 14. Its main feature is scanning the QR code on supermarket purchase invoices to extract and analyze details such as products, prices, and totals. Users can register and, after scanning an invoice, save it in the database linked to their account. This creates a personalized purchase history for tracking spending and consumption habits. The app is optimized for mobile use, taking advantage of the camera to capture QR codes and display information quickly and conveniently. In short, Ticker Scanner digitizes and analyzes purchase invoices for a more efficient, informed experience.'),
  ('ns-cli-runner',
   'NetSuite CLI Runner',
   'A command-line interface (CLI) tool for executing ad-hoc SuiteScript 2.1 code directly against NetSuite accounts.',
   'This project provides a CLI alternative to the NetSuite Instant Runner VS Code extension. It allows developers to execute SuiteScript code from the command line, get structured results, and retrieve execution logs - perfect for automation, testing, and AI agent integration.')
) AS v(slug, name, subtitle, body) ON v.slug = p.slug
ON CONFLICT (project_id, locale) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  body = EXCLUDED.body,
  updated_at = now();

-- English (en): gallery image captions. Every galleryCaptions entry in
-- en.json's projectContent overlay is an empty string (0 non-empty
-- captions across all 6 projects' 14 gallery images today, in either
-- locale) - so this seeds 'en' from the same live project_images.caption
-- column as 'es' above, which is factually identical. If a real,
-- distinct English caption is authored later, update this block to a
-- literal VALUES list keyed by (slug, idx) the same way the name/subtitle/
-- body block above is.
INSERT INTO project_image_translations (project_id, idx, locale, caption, updated_at)
SELECT project_id, idx, 'en', caption, now()
FROM project_images
ON CONFLICT (project_id, idx, locale) DO UPDATE SET
  caption = EXCLUDED.caption,
  updated_at = now();

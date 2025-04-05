-- Migration number: 0001 	 2025-04-05T07:52:32.000Z
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS linkedin_posts;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS exclusive_content;
DROP TABLE IF EXISTS access_logs;

-- Users table for both admin and regular users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
  profile_image TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Blog categories
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  category_id INTEGER,
  author_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published'
  published_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Comments on blog posts
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id INTEGER,
  name TEXT, -- For non-registered users
  email TEXT, -- For non-registered users
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'spam'
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- LinkedIn posts integration
CREATE TABLE IF NOT EXISTS linkedin_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  linkedin_id TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  post_url TEXT,
  published_at DATETIME,
  fetched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Contact form messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread', -- 'unread', 'read', 'replied'
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Exclusive content for registered users
CREATE TABLE IF NOT EXISTS exclusive_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL, -- 'article', 'video', 'pdf', etc.
  file_url TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Access logs for analytics
CREATE TABLE IF NOT EXISTS access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  ip TEXT,
  path TEXT,
  user_agent TEXT,
  accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Initial admin user (password: tuminha1321)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES 
  ('cudeiromaria@gmail.com', '$2a$12$K8GpVyP5M3Jz1.7rOvVZWOsQzXyndZxMd0Ynq4HrfUJtH9G/jbJHa', 'Maria', 'Cudeiro', 'admin');

-- Initial categories
INSERT INTO categories (name, slug, description) VALUES 
  ('Management', 'management', 'Articles about management and leadership'),
  ('Beauty', 'beauty', 'Articles about beauty and self-care'),
  ('Work-Life Balance', 'work-life-balance', 'Articles about balancing professional and personal life'),
  ('Female Leadership', 'female-leadership', 'Articles about women in leadership positions');

-- Create indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_access_logs_user ON access_logs(user_id);
CREATE INDEX idx_access_logs_path ON access_logs(path);

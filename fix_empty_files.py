import os

files = [
    "src/app/counter.ts",
    "src/app/fallback/page.tsx",
    "src/app/admin/setup/page.tsx",
    "src/app/blog/category/[slug]/page.tsx",
    "src/app/blog/page.tsx",
    "src/app/blog/[slug]/page.tsx",
    "src/app/register/page.tsx",
    "src/app/api/contact/route.ts",
    "src/app/api/auth/logout/route.ts",
    "src/app/api/auth/register/route.ts",
    "src/app/api/auth/profile/route.ts",
    "src/app/api/auth/login/route.ts",
    "src/app/api/admin/contact-messages/route.ts",
    "src/app/api/admin/contact-messages/[id]/route.ts",
    "src/app/api/admin/init-db/route.ts",
    "src/app/api/blog/posts/route.ts",
    "src/app/api/blog/posts/[id]/route.ts",
    "src/app/api/blog/categories/route.ts",
    "src/app/api/blog/categories/[id]/route.ts",
    "src/app/api/exclusive-content/route.ts",
    "src/app/api/exclusive-content/[id]/route.ts",
    "src/app/api/linkedin/posts/route.ts",
    "src/app/metadata.ts",
    "src/app/login/page.tsx"
]

page_content = """
export default function PlaceholderPage() {
  return (
    <div className="p-10 border-4 border-black m-10 bg-periospot-cream font-mono">
      <h1 className="text-2xl font-bold uppercase">Work in Progress</h1>
      <p>This section is under construction.</p>
    </div>
  )
}
"""

route_content = """
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Not Implemented" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: "Not Implemented" }, { status: 501 });
}
"""

metadata_content = """
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Woman & Business",
  description: "Platform for women in business",
};
"""

counter_content = """
// Placeholder counter utility
export const counter = {
  value: 0,
  increment: () => { counter.value++ },
  get: () => counter.value
};
"""

for file_path in files:
    if os.path.exists(file_path) and os.path.getsize(file_path) == 0:
        print(f"Populating {file_path}...")
        with open(file_path, "w") as f:
            if file_path.endswith("page.tsx"):
                f.write(page_content)
            elif file_path.endswith("route.ts"):
                f.write(route_content)
            elif file_path.endswith("metadata.ts"):
                f.write(metadata_content)
            elif file_path.endswith("counter.ts"):
                f.write(counter_content)

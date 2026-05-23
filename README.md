<div align="center">

<img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/file-text.svg" width="80" height="80" alt="synax-docs logo" />

# 📝 synax-docs
### Documents, built for speed.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com/)

---

**synax-docs** is a high-performance, collaborative document editor designed for speed and simplicity. 
Built with a modern dark aesthetic, it provides a seamless writing experience with powerful export/import capabilities and robust version control.

[Explore Dashboard](/dashboard) • [Report Bug](https://github.com/yourusername/synaxdocs/issues) • [Request Feature](https://github.com/yourusername/synaxdocs/issues)

</div>

<br />

## ✨ Key Features

🚀 **High Performance** – Built on Next.js 15 for lightning-fast navigation and rendering.  
✍️ **Rich Text Editor** – Fully featured Tiptap editor with headings, tables, code blocks, and task lists.  
📁 **Document Management** – Organize your work with a responsive dashboard, search, and "starred" items.  
🕒 **Version History** – Never lose progress with snapshots and one-click restoration.  
📤 **Export & Import** – Support for PDF, Word (.docx), Markdown (.md), and Plain Text (.txt).  
☁️ **Cloud Media** – Direct image uploads to Cloudinary integrated into the writing flow.  
🗑️ **Smart Trash** – Soft-delete system with a 30-day auto-cleanup cycle.  
📱 **Fully Responsive** – Optimized for mobile, tablet, and desktop viewing.

<br />

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui (New York Dark)](https://ui.shadcn.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with [Immer](https://immerjs.github.io/immer/)
- **Editor**: [Tiptap](https://tiptap.dev/)
- **Storage**: [Cloudinary](https://cloudinary.com/) (Images)

<br />

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm / npm / yarn
- MongoDB Instance (Atlas or Local)
- Clerk Account
- Cloudinary Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/synaxdocs.git
   cd synaxdocs
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add your credentials:
   ```env
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
   CLERK_SECRET_KEY=your_secret
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   # Database
   MONGODB_URI=your_mongodb_uri

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Webhooks
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the result.

<br />

## 📂 Project Structure

```text
├── app/               # Next.js App Router routes & API
├── components/        # Reusable UI components (shadcn + custom)
├── hooks/             # Custom React hooks (AutoSave, etc.)
├── lib/               # Utility functions & core logic
├── models/            # Mongoose schemas (Document, User, Version)
├── store/             # Zustand state stores
├── public/            # Static assets
└── design.md          # Design system tokens & rules
```

<br />

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with ❤️ by [Your Name]
</div>

"use client";

export function NewsletterForm() {
  return (
    <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
      <input type="email" placeholder="Email của bạn" className="input-base flex-1 text-xs py-2" />
      <button type="submit" className="btn-primary py-2 px-4 text-xs whitespace-nowrap">
        Đăng ký
      </button>
    </form>
  );
}

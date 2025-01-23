import Link from "next/link";

export default function Home() {
  return (
    <>
      <div>hello Next JS</div>
      <Link href="/kakao">
        <button>카카오</button>
      </Link>
    </>
  );
}

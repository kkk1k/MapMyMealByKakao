"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function Control() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const option = { method: "DELETE" };
  const deleteData = async () => {
    await fetch(`http://localhost:9999/topics/${id}`, option)
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        router.push(`/`);
        router.refresh();
      });
  };

  return (
    <ul>
      <li>
        <Link href="/create">Create</Link>
      </li>
      {id ? (
        <>
          <li>
            <Link href={"/update/" + id}>Update</Link>
          </li>
          <li>
            <input type="button" value="delete" onClick={deleteData} />
          </li>
        </>
      ) : null}
    </ul>
  );
}

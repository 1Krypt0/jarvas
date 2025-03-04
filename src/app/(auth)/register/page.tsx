import RegisterForm from "./register-form";

export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const plan = (await searchParams)["plan"] ?? "";

  let callbackURL = "/app";

  switch (plan) {
    case "starter":
    case "pro":
    case "enterprise":
      callbackURL = "/dashboard#billing";
      break;
  }

  return (
    <div className="flex w-full items-center justify-center px-4">
      <div className="flex flex-col gap-6 mx-auto max-w-sm">
        <RegisterForm callbackURL={callbackURL} />
      </div>
    </div>
  );
}

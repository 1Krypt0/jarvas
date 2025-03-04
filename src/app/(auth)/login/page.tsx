import LoginForm from "./login-form";

export default function Login() {
  return (
    <div className="flex w-full items-center justify-center px-4">
      <div className="flex flex-col gap-6 mx-auto max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

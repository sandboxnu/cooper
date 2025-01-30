export default function ErrorPage() {
  return (
    <div className="flex h-[85vh] flex-col">
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Authentication Error
        </h1>
        <p className="text-gray-600">You must log in with husky.neu.edu</p>
        <p className="text-gray-600">
          Click the sign in button to try again
        </p>
      </div>
    </div>
    </div>
  );
}

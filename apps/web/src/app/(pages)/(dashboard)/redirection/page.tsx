import React from "react";

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Authentication Error
        </h1>
        <p className="mb-4 text-gray-600">You must log in with husky.neu.edu</p>
        <p className="mb-4 text-gray-600">
          Click the sign in button to try again
        </p>
      </div>
    </div>
  );
}

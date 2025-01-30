import React from "react";

export default function ErrorPage() {

  return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">You must log in with husky.neu.edu</p>
          <p className="text-gray-600 mb-4">Click the sign in button to try again</p>
        </div>
    </div>
  );
}
  
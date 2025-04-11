export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p>{message}</p>
        </div>
      </div>
    );
  }
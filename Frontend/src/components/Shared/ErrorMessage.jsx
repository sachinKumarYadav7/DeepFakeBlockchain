export default function ErrorMessage({ error }) {
    if (!error) return null;
    
    return (
      <p className="mt-2 text-sm text-red-600">
        {error}
      </p>
    );
  }
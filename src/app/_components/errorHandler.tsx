interface ReturnViewProps {
  message: string;
  code: string;
}

export default function ErrorHandler({ message, code }: ReturnViewProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 text-2xl font-semibold text-red-600">
          {code}: {message}
        </h1>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Project Governance Tool</h1>
      <p className="text-lg text-gray-600 mb-8">
        Welcome to your Dataverse-powered Code App!
      </p>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>

        <ol className="list-decimal list-inside space-y-3 text-left">
          <li>
            <strong>Add your Dataverse tables:</strong>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm">
              pac code add-data-source -a dataverse -t crda8_deliverables
            </pre>
          </li>

          <li>
            <strong>Import the generated hooks:</strong>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm">
              {`import { useDeliverablesList } from '@/generated/hooks/useDeliverables';`}
            </pre>
          </li>

          <li>
            <strong>Use the hooks in your components:</strong>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm">
              {`const { data, isLoading } = useDeliverablesList();`}
            </pre>
          </li>

          <li>
            <strong>Build and push:</strong>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm">
              npm run build && pac code push
            </pre>
          </li>
        </ol>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            📚 Check <code>STEP_BY_STEP_GUIDE.md</code> for detailed instructions
          </p>
        </div>
      </div>
    </div>
  );
}

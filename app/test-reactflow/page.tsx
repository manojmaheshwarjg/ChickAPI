import dynamic from 'next/dynamic'

// Test page for React Flow integration
const ReactFlowDemo = dynamic(() => import('@/components/reactflow/ReactFlowDemo'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading React Flow Demo...</p>
      </div>
    </div>
  ),
})

export default function TestReactFlowPage() {
  return <ReactFlowDemo />
}

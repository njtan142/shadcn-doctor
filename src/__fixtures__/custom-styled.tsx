export const CustomStyledCard = () => {
  return (
    <div>
      <div className="border rounded-lg shadow-sm p-4">Custom card 1</div>
      <div className="border-2 rounded-xl shadow-md p-6 bg-white">Custom card 2</div>
      <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
        Custom gradient card
      </div>
      <div className="border border-gray-300 rounded-lg p-4">Border only card</div>
      <div className="rounded-lg shadow-md">Rounded and shadow only</div>
      <div className="flex items-center justify-center p-4">Layout div with flex</div>
      <div className="grid grid-cols-2 gap-4 p-4">Grid container</div>
      <div className="flex flex-col p-4 border rounded shadow">Flex with many signals</div>
    </div>
  );
};

export const ShadcnCardUsage = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Using shadcn Card</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

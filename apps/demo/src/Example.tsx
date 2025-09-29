import { lightTheme } from '@uiw/react-json-view/light';
import { type Example as ExampleType } from './examples/types';
import JsonView from '@uiw/react-json-view';
import { useState } from 'react';

interface ExampleProps {
  target: string;
  example: ExampleType;
}

export const Example = ({ example, target }: ExampleProps) => {
  const [result, setResult] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const execute = async () => {
    try {
      const response = await fetch(`http://localhost:3000/${target}/filter`, {
        method: 'POST',
        body: JSON.stringify(example.payload),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to filter data');
      }
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="example">
      <div className="header">
        <p>{example.description}</p>
        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {isExpanded && (
        <>
          <JsonView
            value={example.payload}
            style={lightTheme}
            displayDataTypes={false}
          />
          <button onClick={execute}>Execute</button>
          {result && (
            <JsonView
              value={result}
              style={lightTheme}
              displayDataTypes={false}
            />
          )}
        </>
      )}
    </div>
  );
};

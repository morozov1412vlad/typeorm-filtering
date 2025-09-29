import React, { useMemo, useState } from 'react';
import { type CompoundFilter, ConditionalOperator } from './types';
import CodeEditor from '@uiw/react-textarea-code-editor';
import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';

interface CustomFilterProps {
  target: string;
}

export const CustomFilter: React.FC<CustomFilterProps> = ({ target }) => {
  const [filterStr, setFilterStr] = useState<string>(
    JSON.stringify(
      {
        attribute: target,
        filters: {
          conditional_operator: ConditionalOperator.AND,
          conditions: [],
        },
      },
      null,
      2,
    ),
  );

  const [result, setResult] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const isValid = useMemo(() => {
    try {
      JSON.parse(filterStr);
      return true;
    } catch (error) {
      return false;
    }
  }, [filterStr]);

  const execute = async () => {
    try {
      const response = await fetch(`http://localhost:3000/${target}/filter`, {
        method: 'POST',
        body: filterStr,
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
        <p>Try creating your own filter</p>
        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {isExpanded && (
        <>
          <CodeEditor
            value={filterStr}
            onChange={(e) => {
              setFilterStr(e.target.value);
            }}
            language="json"
            style={{ fontSize: '14px' }}
          />
          <button onClick={execute} disabled={!isValid}>
            Execute
          </button>
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

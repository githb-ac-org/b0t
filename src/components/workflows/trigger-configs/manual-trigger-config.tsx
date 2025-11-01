'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ManualTriggerConfigProps {
  onConfigChange: (config: Record<string, unknown>) => void;
}

export function ManualTriggerConfig({ onConfigChange }: ManualTriggerConfigProps) {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [customParams, setCustomParams] = useState('{}');

  const handleChange = () => {
    let params = {};
    try {
      params = JSON.parse(customParams);
    } catch {
      // Invalid JSON, ignore
    }

    onConfigChange({
      prompt,
      model,
      ...params,
    });
  };

  const availableModels = [
    { value: 'gpt-4', label: 'GPT-4 (Most Capable)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Faster)' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast & Cheap)' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku (Fast)' },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt (Optional)</Label>
        <Textarea
          id="prompt"
          placeholder="Enter a prompt for this workflow execution..."
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            handleChange();
          }}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Use <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{trigger.prompt}}'}</code> in workflow steps
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">LLM Model</Label>
        <Select
          value={model}
          onValueChange={(value) => {
            setModel(value);
            handleChange();
          }}
        >
          <SelectTrigger id="model">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Use <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{trigger.model}}'}</code> in workflow steps
        </p>
      </div>

      <details className="space-y-2">
        <summary className="text-sm font-medium cursor-pointer hover:underline">
          Advanced: Custom Parameters (JSON)
        </summary>
        <Textarea
          placeholder='{"key": "value", "temperature": 0.7}'
          value={customParams}
          onChange={(e) => {
            setCustomParams(e.target.value);
            handleChange();
          }}
          rows={4}
          className="resize-none font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Add custom parameters as JSON. Access via <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{trigger.paramName}}'}</code>
        </p>
      </details>
    </div>
  );
}

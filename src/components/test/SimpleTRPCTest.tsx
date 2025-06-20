'use client';

import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function SimpleTRPCTest() {
  const [echoInput, setEchoInput] = useState('');

  // tRPC queries and mutations
  const { data: helloData, isLoading: helloLoading } = trpc.simple.hello.useQuery({ name: 'tRPC' });
  const echoMutation = trpc.simple.echo.useMutation();

  const handleEcho = () => {
    if (echoInput) {
      echoMutation.mutate(echoInput);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Simple tRPC Test</h1>
      
      {/* Hello Query */}
      <Card>
        <CardHeader>
          <CardTitle>Hello Query</CardTitle>
        </CardHeader>
        <CardContent>
          {helloLoading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <p><strong>Greeting:</strong> {helloData?.greeting}</p>
              <p><strong>Timestamp:</strong> {helloData?.timestamp}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Echo Mutation */}
      <Card>
        <CardHeader>
          <CardTitle>Echo Mutation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter text to echo"
              value={echoInput}
              onChange={(e) => setEchoInput(e.target.value)}
            />
            <Button onClick={handleEcho} disabled={echoMutation.isPending}>
              Echo
            </Button>
          </div>
          
          {echoMutation.data && (
            <div className="p-2 border rounded bg-gray-50">
              <p><strong>Response:</strong> {echoMutation.data.message}</p>
              <p><strong>Timestamp:</strong> {echoMutation.data.timestamp}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
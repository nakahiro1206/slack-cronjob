'use client';

import { SimpleTRPCTest } from "@/components/test/SimpleTRPCTest";
import { TRPCTest } from "@/components/test/TRPCTest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TRPC() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Slack Bolt Cronjob - GraphQL to REST API Migration</h1>
      
      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simple">Simple tRPC</TabsTrigger>
          <TabsTrigger value="trpc">tRPC</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simple" className="mt-6">
          <SimpleTRPCTest />
        </TabsContent>
        
        <TabsContent value="trpc" className="mt-6">
          <TRPCTest />
        </TabsContent>
      </Tabs>
    </div>
  );
}

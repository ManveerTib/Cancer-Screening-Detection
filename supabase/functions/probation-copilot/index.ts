import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QueryRequest {
  query: string;
  confirmSubmit?: boolean;
  nodeIds?: string[];
}

interface KustoResponse {
  Tables: Array<{
    TableName: string;
    Columns: Array<{ ColumnName: string; DataType: string }>;
    Rows: Array<Array<any>>;
  }>;
}

interface SubmitAction {
  isSubmitAction: boolean;
  nodeIds: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { query, confirmSubmit, nodeIds: providedNodeIds }: QueryRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const azureOpenAiEndpoint = Deno.env.get("AZURE_OPENAI_ENDPOINT") || "";
    const azureOpenAiKey = Deno.env.get("AZURE_OPENAI_KEY") || "";
    const azureOpenAiDeployment = Deno.env.get("AZURE_OPENAI_DEPLOYMENT") || "";
    const kustoClusterUrl = Deno.env.get("KUSTO_CLUSTER_URL") || "";
    const kustoDatabase = Deno.env.get("KUSTO_DATABASE") || "";
    const kustoTable = Deno.env.get("KUSTO_TABLE") || "";
    const kustoSubmitTable = Deno.env.get("KUSTO_SUBMIT_TABLE") || "ProbationRequests";

    if (!azureOpenAiEndpoint || !azureOpenAiKey || !kustoClusterUrl) {
      return new Response(
        JSON.stringify({
          error: "Configuration missing",
          response: "The system is not fully configured yet. Please ensure Azure OpenAI and Kusto endpoints are set up in the environment variables."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (confirmSubmit && providedNodeIds && providedNodeIds.length > 0) {
      try {
        const submitResult = await submitNodesToKusto(
          kustoClusterUrl,
          kustoDatabase,
          kustoSubmitTable,
          providedNodeIds
        );

        if (submitResult.success) {
          const nodeList = providedNodeIds.map(id => `• ${id}`).join('\n');
          const response = `✅ Submission completed successfully!\n\nThe following node(s) have been submitted for probation testing:\n\n${nodeList}\n\n📋 You can track your request from:\n• Request to Review Tab\n• My Submissions Tab`;

          return new Response(
            JSON.stringify({ response }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } else {
          const response = `❌ I encountered an issue while submitting the nodes: ${submitResult.error}\n\nPlease try again or contact support if the problem persists.`;
          return new Response(
            JSON.stringify({ response }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } catch (error) {
        console.error("Submit error:", error);
        const response = "❌ I encountered an error while submitting the nodes for probation testing. Please try again later.";
        return new Response(
          JSON.stringify({ response }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const submitAction = detectSubmitAction(query);

    if (submitAction.isSubmitAction && submitAction.nodeIds.length > 0) {
      try {
        const nodeDetailsQuery = submitAction.nodeIds.map(id =>
          `${kustoTable} | where NodeId == "${id}" | take 1`
        ).join(' | union ');

        let nodeDetails: Array<any> = [];
        try {
          const kustoResponse = await fetch(`${kustoClusterUrl}/v1/rest/query`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              db: kustoDatabase,
              csl: nodeDetailsQuery,
            }),
          });

          if (kustoResponse.ok) {
            const kustoResult: KustoResponse = await kustoResponse.json();
            if (kustoResult.Tables && kustoResult.Tables.length > 0) {
              const table = kustoResult.Tables[0];
              const columns = table.Columns.map(c => c.ColumnName);
              nodeDetails = table.Rows.map(row => {
                const nodeObj: any = { nodeId: '' };
                columns.forEach((col, idx) => {
                  if (col === 'NodeId') nodeObj.nodeId = row[idx];
                  if (col === 'Tenant') nodeObj.tenant = row[idx];
                  if (col === 'SourceType') nodeObj.sourceType = row[idx];
                  if (col === 'Model') nodeObj.model = row[idx];
                  if (col === 'NodeStatus') nodeObj.status = row[idx];
                });
                return nodeObj;
              });
            }
          }
        } catch (error) {
          console.error("Error fetching node details:", error);
        }

        if (nodeDetails.length === 0) {
          nodeDetails = submitAction.nodeIds.map(id => ({ nodeId: id }));
        }

        const nodeList = nodeDetails.map(node => {
          let details = `• Node ID: ${node.nodeId}`;
          if (node.tenant) details += `\n  Tenant: ${node.tenant}`;
          if (node.sourceType) details += `\n  Source Type: ${node.sourceType}`;
          if (node.model) details += `\n  Model: ${node.model}`;
          if (node.status) details += `\n  Status: ${node.status}`;
          return details;
        }).join('\n\n');

        const response = `I found the following node(s):\n\n${nodeList}\n\nDo you want to submit these node(s) for probation testing? (Yes/No)`;

        return new Response(
          JSON.stringify({
            response,
            awaitingConfirmation: true,
            nodeDetails,
            nodeIds: submitAction.nodeIds
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("Error processing submit request:", error);
        const response = "I encountered an error while processing your request. Please try again.";
        return new Response(
          JSON.stringify({ response }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const kustoQuery = generateKustoQuery(query, kustoTable);

    let kustoData = "";
    try {
      const kustoResponse = await fetch(`${kustoClusterUrl}/v1/rest/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          db: kustoDatabase,
          csl: kustoQuery,
        }),
      });

      if (kustoResponse.ok) {
        const kustoResult: KustoResponse = await kustoResponse.json();
        kustoData = formatKustoResults(kustoResult);
      } else {
        kustoData = "Unable to retrieve data from Kusto at this time.";
      }
    } catch (error) {
      console.error("Kusto query error:", error);
      kustoData = "Error querying Kusto database.";
    }

    const systemPrompt = `You are a helpful Co-pilot Assistant for a node testing system.
You help users understand node status, probation details, test results, and related analytics.
You can also help users submit nodes for probation testing when they request it.
Provide clear, concise, and well-formatted responses.

User Query: ${query}

Data from Kusto:
${kustoData}

Based on the data above, provide a helpful and informative response to the user's query.`;

    const openAiResponse = await fetch(
      `${azureOpenAiEndpoint}/openai/deployments/${azureOpenAiDeployment}/chat/completions?api-version=2024-02-15-preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": azureOpenAiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: query,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    if (!openAiResponse.ok) {
      throw new Error("Failed to get response from Azure OpenAI");
    }

    const openAiResult = await openAiResponse.json();
    const assistantResponse = openAiResult.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        response: "I encountered an error processing your request. Please try again later."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function detectSubmitAction(query: string): SubmitAction {
  const lowerQuery = query.toLowerCase();
  const isSubmit = (
    (lowerQuery.includes('submit') || lowerQuery.includes('create') || lowerQuery.includes('add')) &&
    (lowerQuery.includes('node') || lowerQuery.includes('probation') || lowerQuery.includes('test'))
  );

  if (!isSubmit) {
    return { isSubmitAction: false, nodeIds: [] };
  }

  const nodeIds: string[] = [];

  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const matches = query.match(uuidPattern);

  if (matches) {
    nodeIds.push(...matches);
  }

  const nodeIdPattern = /node\s*(?:id)?:?\s*([a-z0-9-]+)/gi;
  let match;
  while ((match = nodeIdPattern.exec(query)) !== null) {
    const id = match[1];
    if (!nodeIds.includes(id)) {
      nodeIds.push(id);
    }
  }

  return {
    isSubmitAction: nodeIds.length > 0,
    nodeIds,
  };
}

async function submitNodesToKusto(
  kustoClusterUrl: string,
  kustoDatabase: string,
  tableName: string,
  nodeIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const timestamp = new Date().toISOString();
    const requestId = crypto.randomUUID();

    const rows = nodeIds.map(nodeId => {
      return {
        RequestId: requestId,
        NodeId: nodeId,
        Status: "Submitted",
        SubmittedAt: timestamp,
        SubmittedBy: "Co-pilot Assistant",
        RequestType: "Probation Testing"
      };
    });

    const ingestCommand = `.ingest inline into table ${tableName} <|\n` +
      rows.map(row => JSON.stringify(row)).join('\n');

    const response = await fetch(`${kustoClusterUrl}/v1/rest/mgmt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        db: kustoDatabase,
        csl: ingestCommand,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Kusto submit error:", errorText);
      return { success: false, error: `Failed to submit to Kusto: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Submit to Kusto error:", error);
    return { success: false, error: String(error) };
  }
}

function generateKustoQuery(userQuery: string, tableName: string): string {
  const lowerQuery = userQuery.toLowerCase();

  if (lowerQuery.includes("node") && lowerQuery.includes("tenant")) {
    const tenantMatch = userQuery.match(/tenant\s+([\w\d]+)/i);
    const tenant = tenantMatch ? tenantMatch[1] : "";
    return `${tableName} | where Tenant == "${tenant}" | take 100`;
  }

  if (lowerQuery.includes("m-series") && lowerQuery.includes("probation")) {
    const genMatch = userQuery.match(/generation\s+(\d+)/i);
    if (genMatch) {
      const gen = genMatch[1];
      return `${tableName} | where SourceType contains "M-Series" and Generation == ${gen} and NodeStatus == "InProbation" | take 100`;
    }
    return `${tableName} | where SourceType contains "M-Series" and NodeStatus == "InProbation" | take 100`;
  }

  if (lowerQuery.includes("more than") && lowerQuery.includes("days")) {
    const daysMatch = userQuery.match(/(\d+)\s+days/i);
    const days = daysMatch ? daysMatch[1] : "15";
    return `${tableName} | where Age_in_probation > ${days} and NodeStatus == "InProbation" | take 100`;
  }

  if (lowerQuery.includes("status") && lowerQuery.includes("node")) {
    const nodeIdMatch = userQuery.match(/node\s+([\w\d-]+)/i) || userQuery.match(/([\w\d]{8}-[\w\d]{4}-[\w\d]{4}-[\w\d]{4}-[\w\d]{12})/i);
    const nodeId = nodeIdMatch ? nodeIdMatch[1] : "";
    if (nodeId) {
      return `${tableName} | where NodeId == "${nodeId}" | take 10`;
    }
  }

  return `${tableName} | where NodeStatus == "InProbation" | take 50`;
}

function formatKustoResults(result: KustoResponse): string {
  if (!result.Tables || result.Tables.length === 0) {
    return "No data found.";
  }

  const table = result.Tables[0];
  const columns = table.Columns.map(c => c.ColumnName);
  const rows = table.Rows;

  if (rows.length === 0) {
    return "No records found matching your query.";
  }

  let formatted = `Found ${rows.length} record(s):\n\n`;
  rows.forEach((row, idx) => {
    formatted += `Record ${idx + 1}:\n`;
    columns.forEach((col, colIdx) => {
      formatted += `  ${col}: ${row[colIdx] || "N/A"}\n`;
    });
    formatted += "\n";
  });

  return formatted;
}

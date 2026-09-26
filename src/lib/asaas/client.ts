/**
 * Client mínimo para a API do Asaas.
 *
 * ASAAS_API_KEY: chave da conta raiz (a principal, da plataforma).
 * ASAAS_API_URL: https://api-sandbox.asaas.com/v3 (testes) ou
 *                https://api.asaas.com/v3 (produção).
 *
 * Ambas devem ser configuradas como variáveis de ambiente — nunca
 * com prefixo NEXT_PUBLIC_, já que dão acesso total à conta.
 */
export async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.ASAAS_API_KEY;
  const baseUrl = process.env.ASAAS_API_URL ?? "https://api-sandbox.asaas.com/v3";

  if (!apiKey) {
    throw new Error("ASAAS_API_KEY não configurada.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "DeliverySaaS/1.0",
      access_token: apiKey,
      ...(init?.headers ?? {}),
    },
  });

  const rawText = await response.text();
  let data: any = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    // resposta não veio em JSON (ex.: erro de infraestrutura, HTML de erro)
  }

  if (!response.ok) {
    const message =
      data?.errors?.[0]?.description ??
      `Erro ao se comunicar com o Asaas (HTTP ${response.status}): ${rawText.slice(0, 200)}`;
    throw new Error(message);
  }

  return data as T;
}

export interface CreateAsaasAccountInput {
  name: string;
  email: string;
  cpfCnpj: string;
  birthDate?: string;
  companyType?: "MEI" | "LIMITED" | "INDIVIDUAL" | "ASSOCIATION";
  phone?: string;
  mobilePhone: string;
  address: string;
  addressNumber: string;
  complement?: string;
  province: string;
  postalCode: string;
}

export interface AsaasAccountResponse {
  id: string;
  walletId: string;
  apiKey: string;
  name: string;
  email: string;
}

export function createAsaasSubaccount(input: CreateAsaasAccountInput) {
  return asaasFetch<AsaasAccountResponse>("/accounts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/store/cart-context";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Address {
  id: string;
  street: string;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  complement: string | null;
}

interface StoreSettings {
  is_open: boolean;
  min_order_value: number;
  delivery_fee: number;
}

function translateCheckoutError(message: string) {
  if (message.includes("store is closed")) {
    return "A loja está fechada no momento. Tente novamente mais tarde.";
  }
  if (message.includes("order below minimum value")) {
    return "O valor do pedido está abaixo do mínimo exigido pela loja.";
  }
  if (message.includes("product not available")) {
    return "Um dos produtos do carrinho não está mais disponível. Volte ao carrinho e revise os itens.";
  }
  if (message.includes("invalid address")) {
    return "Endereço inválido. Selecione ou cadastre um endereço novamente.";
  }
  return message;
}

export function CheckoutForm({
  companyId,
  slug,
  customerId,
  storeSettings,
  initialAddresses,
}: {
  companyId: string;
  slug: string;
  customerId: string | null;
  storeSettings: StoreSettings;
  initialAddresses: Address[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const { items, totalValue, clear } = useCart();

  const [resolvedCustomerId, setResolvedCustomerId] = useState(customerId);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new" | null>(
    initialAddresses[0]?.id ?? "new"
  );

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [complement, setComplement] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFee = Number(storeSettings.delivery_fee) || 0;
  const minOrder = Number(storeSettings.min_order_value) || 0;
  const total = totalValue + deliveryFee;
  const belowMinimum = totalValue < minOrder;

  // Garante que existe um customer para esta empresa, mesmo que o
  // usuário tenha chegado aqui sem passar pelo fluxo normal de login.
  useEffect(() => {
    if (resolvedCustomerId) return;
    supabase.rpc("get_or_create_customer", { p_company_id: companyId }).then(({ data }) => {
      if (data?.id) setResolvedCustomerId(data.id);
    });
  }, [resolvedCustomerId, companyId, supabase]);

  async function handleCepBlur() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
      }
    } catch {
      // Falha na consulta de CEP não deve travar o checkout; o
      // cliente pode preencher manualmente.
    } finally {
      setCepLoading(false);
    }
  }

  async function handleFinalizar() {
    setError(null);

    if (items.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }
    if (belowMinimum) {
      setError(
        `O pedido mínimo desta loja é ${formatBRL(minOrder)}. Adicione mais itens ao carrinho.`
      );
      return;
    }
    if (!resolvedCustomerId) {
      setError("Não foi possível identificar seu cadastro. Tente recarregar a página.");
      return;
    }

    setSubmitting(true);

    let addressId = selectedAddressId !== "new" ? selectedAddressId : null;

    if (selectedAddressId === "new") {
      if (!street || !number || !neighborhood || !city || !state) {
        setError("Preencha rua, número, bairro, cidade e estado.");
        setSubmitting(false);
        return;
      }

      const { data: newAddress, error: addressError } = await supabase
        .from("addresses")
        .insert({
          company_id: companyId,
          customer_id: resolvedCustomerId,
          street,
          number,
          neighborhood,
          city,
          state,
          zip_code: cep || null,
          complement: complement || null,
        })
        .select()
        .single();

      if (addressError || !newAddress) {
        setError(addressError?.message ?? "Não foi possível salvar o endereço.");
        setSubmitting(false);
        return;
      }

      addressId = newAddress.id;
      setAddresses((prev) => [newAddress, ...prev]);
    }

    const { data: order, error: rpcError } = await supabase.rpc("checkout_create_order", {
      p_company_id: companyId,
      p_address_id: addressId as string,
      p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
    });

    if (rpcError || !order) {
      setError(translateCheckoutError(rpcError?.message ?? "Erro ao criar o pedido."));
      setSubmitting(false);
      return;
    }

    clear();
    router.push(`/loja/${slug}/pedido/${order.id}`);
  }

  return (
    <div className="min-h-screen bg-store-bg text-store-text">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-black/5 bg-store-bg/95 px-4 py-3 backdrop-blur">
        <Link
          href={`/loja/${slug}/carrinho`}
          aria-label="Voltar para o carrinho"
          className="rounded-full p-2 hover:bg-store-card"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </Link>
        <p className="text-sm font-semibold">Finalizar pedido</p>
      </header>

      {!storeSettings.is_open && (
        <div className="mx-4 mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">
          Esta loja está fechada no momento. Você pode montar o pedido, mas o envio pode não
          ser aceito até ela reabrir.
        </div>
      )}

      <section className="space-y-3 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-store-text-secondary">
          Endereço de entrega
        </p>

        {addresses.map((addr) => (
          <label
            key={addr.id}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/5 bg-store-card p-3"
          >
            <input
              type="radio"
              name="address"
              checked={selectedAddressId === addr.id}
              onChange={() => setSelectedAddressId(addr.id)}
              className="mt-1"
            />
            <span className="text-sm">
              {addr.street}, {addr.number} — {addr.neighborhood}
              <br />
              <span className="text-store-text-secondary">
                {addr.city}/{addr.state} {addr.zip_code ? `· ${addr.zip_code}` : ""}
              </span>
            </span>
          </label>
        ))}

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/5 bg-store-card p-3">
          <input
            type="radio"
            name="address"
            checked={selectedAddressId === "new"}
            onChange={() => setSelectedAddressId("new")}
          />
          <span className="text-sm font-medium">Usar um novo endereço</span>
        </label>

        {selectedAddressId === "new" && (
          <div className="space-y-2 rounded-xl border border-black/5 bg-store-card p-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-store-text-secondary">
                CEP
              </label>
              <input
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                onBlur={handleCepBlur}
                placeholder="00000-000"
                className="w-full rounded-lg border border-black/10 bg-store-bg px-3 py-2 text-sm outline-none focus:border-store-accent"
              />
              {cepLoading && (
                <p className="mt-1 text-xs text-store-text-secondary">Buscando endereço...</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-store-text-secondary">
                  Rua
                </label>
                <input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-store-bg px-3 py-2 text-sm outline-none focus:border-store-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-store-text-secondary">
                  Número
                </label>
                <input
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-store-bg px-3 py-2 text-sm outline-none focus:border-store-accent"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-store-text-secondary">
                Bairro
              </label>
              <input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-store-bg px-3 py-2 text-sm outline-none focus:border-store-accent"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-store-text-secondary">
                  Cidade
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-store-bg px-3 py-2 text-sm outline-none focus:border-store-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-store-text-secondary">
                  UF
                </label>
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                  className="w-full rounded-lg border border-black/10 bg-store-bg px-3 py-2 text-sm outline-none focus:border-store-accent"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-store-text-secondary">
                Complemento (opcional)
              </label>
              <input
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-store-bg px-3 py-2 text-sm outline-none focus:border-store-accent"
              />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-2 px-4 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-store-text-secondary">
          Resumo do pedido
        </p>
        <div className="space-y-1 rounded-xl border border-black/5 bg-store-card p-3 text-sm">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>{formatBRL(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-black/10 pt-2 text-store-text-secondary">
            <span>Taxa de entrega</span>
            <span>{formatBRL(deliveryFee)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-semibold">
            <span>Total</span>
            <span>{formatBRL(total)}</span>
          </div>
          {minOrder > 0 && (
            <p className="pt-1 text-xs text-store-text-secondary">
              Pedido mínimo: {formatBRL(minOrder)}
            </p>
          )}
        </div>
      </section>

      {error && (
        <div className="mx-4 mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <section className="sticky bottom-0 border-t border-black/5 bg-store-bg px-4 py-4">
        <button
          onClick={handleFinalizar}
          disabled={submitting || items.length === 0}
          className="block w-full rounded-full bg-store-accent py-3 text-center text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Enviando pedido..." : "Confirmar pedido"}
        </button>
      </section>
    </div>
  );
}
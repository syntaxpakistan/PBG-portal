"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { addProduct, updateProduct } from "./actions";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  category: string;
  spec: string | null;
  catalogNo: string | null;
  price: number | null;
  unit: string | null;
  stockStatus: string;
  leadTimeDays: number | null;
};

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const editing = !!product;
  const input = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] outline-none focus:border-navy-3";

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          if (editing) await updateProduct(product.id, new FormData(e.currentTarget));
          else {
            await addProduct(new FormData(e.currentTarget));
            (e.target as HTMLFormElement).reset();
          }
          toast.success(editing ? "Product updated." : "Product listed — moderated by Syntax.");
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed");
        }
        setLoading(false);
      }}
      className="space-y-3"
    >
      <input name="name" required defaultValue={product?.name} placeholder="Product name *" className={input} />
      <div className="grid grid-cols-2 gap-3">
        <select name="category" required defaultValue={product?.category ?? ""} className={input}>
          <option value="">Category *</option>
          {["Reagents", "Kits", "Consumables", "Media", "Plasticware", "Equipment"].map((c) => <option key={c}>{c}</option>)}
          {editing && !["Reagents", "Kits", "Consumables", "Media", "Plasticware", "Equipment"].includes(product.category) && <option>{product.category}</option>}
        </select>
        <input name="spec" defaultValue={product?.spec ?? ""} placeholder="Spec / variant" className={input} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input name="price" type="number" min={0} defaultValue={product?.price ?? ""} placeholder="Price (PKR)" className={input} />
        <input name="unit" defaultValue={product?.unit ?? ""} placeholder="Unit (kit, vial, pack)" className={input} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input name="catalogNo" defaultValue={product?.catalogNo ?? ""} placeholder="Catalog / SKU #" className={input} />
        <select name="stockStatus" defaultValue={product?.stockStatus ?? "IN_STOCK"} className={input}>
          <option value="IN_STOCK">In stock</option>
          <option value="LOW_STOCK">Low stock</option>
          <option value="BACKORDER">Backordered</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
        </select>
        <input name="leadTimeDays" type="number" min={0} defaultValue={product?.leadTimeDays ?? ""} placeholder="Lead time (days)" className={input} />
      </div>
      <button type="submit" disabled={loading} className="btn-secondary w-full justify-center !py-2.5">
        {loading ? <Loader2 className="size-4 animate-spin" /> : editing ? "Save changes" : "Add product"}
      </button>
    </form>
  );
}

// catalog row with expandable inline editor
export function ProductRow({ product: p, priceLabel, stockBadge }: { product: Product; priceLabel: React.ReactNode; stockBadge: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-5 py-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-medium text-ink">{p.name}</div>
          <div className="text-[11.5px] text-muted">
            {p.category}{p.spec ? ` · ${p.spec}` : ""}{p.catalogNo ? ` · #${p.catalogNo}` : ""}
            {p.leadTimeDays ? ` · ${p.leadTimeDays}d lead` : ""}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stockBadge}
          {priceLabel}
          <button onClick={() => setOpen(!open)} className="rounded-full border border-line p-1.5 text-muted hover:bg-paper-2 hover:text-ink" title="Edit product">
            <Pencil className="size-3.5" />
          </button>
        </div>
      </div>
      {open && <div className="mt-3 rounded-lg bg-paper-2 p-4"><ProductForm product={p} /></div>}
    </div>
  );
}

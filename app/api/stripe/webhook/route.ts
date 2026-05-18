import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Stripe に raw body を渡すため body parser を無効化
export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  const db = getSupabaseAdmin();

  // 支払い完了 → プレミアム有効化
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.supabase_user_id;
    const customerId = session.customer as string | null;
    if (userId) {
      await db.from("profiles").upsert({
        id: userId,
        is_premium: true,
        ...(customerId ? { stripe_customer_id: customerId } : {}),
      });
    }
  }

  // 請求成功 → プレミアム継続確認
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const userId = (invoice as any).subscription_details?.metadata?.supabase_user_id
      ?? invoice.metadata?.supabase_user_id;
    if (userId) {
      await db.from("profiles").upsert({ id: userId, is_premium: true });
    }
  }

  // サブスク解約 → プレミアム無効化
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.supabase_user_id;
    if (userId) {
      await db.from("profiles").update({ is_premium: false }).eq("id", userId);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void stripe; // used above for constructEvent

  return NextResponse.json({ received: true });
}

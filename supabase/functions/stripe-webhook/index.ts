import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.9.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!sig || !secret) {
    return new Response("Missing signature or secret", {
      status: 400,
    });
  }

  let body;
  try {
    const bodyBuffer = await new Response(req.body).arrayBuffer();
    body = new TextDecoder("utf-8").decode(bodyBuffer);
  } catch {
    return new Response("Could not read raw body", {
      status: 400,
    });
  }

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, secret);
    console.log("✅ Event verified:", event.type);
  } catch (err) {
    console.error("❌ Invalid signature", err.message);
    return new Response("Signature verification failed", {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Checkout session completed:", session.id);
  }

  return new Response("Webhook received", { status: 200 });
});
// Trigger redeploy after fixing webhook secret


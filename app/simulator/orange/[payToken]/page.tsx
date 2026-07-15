import { confirmOrangePayment } from "./actions";

export default function OrangeConfirmPage({ params }: { params: { payToken: string } }) {
  return (
    <div>
      <h1>Confirmation de paiement Orange Money (simulation)</h1>
      <form action={async () => { "use server"; await confirmOrangePayment(params.payToken, true); }}>
        <button type="submit">Accepter</button>
      </form>
      <form action={async () => { "use server"; await confirmOrangePayment(params.payToken, false); }}>
        <button type="submit">Refuser</button>
      </form>
    </div>
  );
}
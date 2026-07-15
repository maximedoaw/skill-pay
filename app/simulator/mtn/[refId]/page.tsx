import { confirmMtnPayment } from "./actions";

export default function MtnConfirmPage({ params }: { params: { refId: string } }) {
  return (
    <div>
      <h1>Confirmation de paiement MTN MoMo (simulation)</h1>
      <form action={async () => { "use server"; await confirmMtnPayment(params.refId, true); }}>
        <button type="submit">Accepter</button>
      </form>
      <form action={async () => { "use server"; await confirmMtnPayment(params.refId, false); }}>
        <button type="submit">Refuser</button>
      </form>
    </div>
  );
}
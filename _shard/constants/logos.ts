import mvola from "@/assets/logos/mvola.jpg";
import airtelMoney from "@/assets/logos/airtelmoney.png";
import orangeMoney from "@/assets/logos/orangemoney.png";
import paypal from "@/assets/logos/paypal.png";
import stripe from "@/assets/logos/stripe.png";

/**
 * Logos des partenaires de paiement, sur le modèle de `icons.ts` / `images.ts`.
 *
 * Ce sont des marques déposées : on les affiche telles quelles, sans les
 * recolorer ni les redessiner (donc jamais de `tintColor` dessus). Les
 * fichiers n'ont pas le même cadrage — aplats de couleur bord à bord pour
 * MVola et Airtel, fond transparent pour PayPal, canevas blanc 16:9 pour
 * Stripe — d'où le `logoFit` porté par chaque opérateur dans `payments.ts`.
 */
export default {
	mvola,
	airtelMoney,
	orangeMoney,
	paypal,
	stripe,
};

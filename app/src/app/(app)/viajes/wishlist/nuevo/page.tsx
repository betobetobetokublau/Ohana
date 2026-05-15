import { requireCoupleContext } from '@/lib/auth-helpers';
import { isUserA as checkUserA, partnerOf } from '@/lib/utils/partner';
import { NewWishForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Agregar a wishlist' };
export const dynamic = 'force-dynamic';

export default async function NewWishPage() {
  const { couple, user } = await requireCoupleContext();
  const isUserA = checkUserA(couple, user.id);

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Wishlist"
        title="Algo que quieren"
        titleAccent="hacer algún día"
        subtitle="Cada quien marca su nivel de interés del 1 al 5."
      />
      <NewWishForm coupleId={couple.id} userId={user.id} isUserA={isUserA} />
    </div>
  );
}

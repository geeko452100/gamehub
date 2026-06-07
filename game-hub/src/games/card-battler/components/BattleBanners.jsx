import { Shield } from 'lucide-react';

function Banner({ top, border, bg, label, title, subtitle, visible, slidingOut, extra }) {
  return (
    <div className={`fixed left-1/2 ${top} z-40 w-[min(92vw,28rem)] -translate-x-1/2 rounded-3xl border ${border} ${bg} p-4 text-center shadow-2xl transition-all duration-500 ease-out ${visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} ${slidingOut ? '-translate-y-16 opacity-0' : ''}`}>
      <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{label}</p>
      <h2 className="mt-2 text-lg font-black text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
      {extra}
    </div>
  );
}

export default function BattleBanners({
  startingBanner,
  startingBannerSlidingOut,
  phaseBanner,
  phaseSlidingOut,
  attackBanner,
  attackBannerSlidingOut,
  defenseBanner,
  defenseBannerSlidingOut,
  enemyAttackBanner,
  enemyAttackBannerSlidingOut,
  enemyDefenseBanner,
  enemyDefenseBannerSlidingOut,
}) {
  return (
    <>
      <Banner
        top="top-6"
        border="border-amber-500"
        bg="bg-amber-600/95"
        label="Game Start"
        title={startingBanner.title}
        subtitle={startingBanner.subtitle}
        visible={startingBanner.visible}
        slidingOut={startingBannerSlidingOut}
      />
      <Banner
        top="top-24"
        border="border-slate-700"
        bg="bg-slate-950/95"
        label="Phase Alert"
        title={phaseBanner.title}
        subtitle={phaseBanner.subtitle}
        visible={phaseBanner.visible}
        slidingOut={phaseSlidingOut}
      />
      <Banner
        top="top-24"
        border="border-rose-500"
        bg="bg-rose-600/95"
        label="Attack!"
        title={attackBanner.title}
        subtitle={attackBanner.subtitle}
        visible={attackBanner.visible}
        slidingOut={attackBannerSlidingOut}
      />
      <Banner
        top="top-40"
        border="border-slate-700"
        bg="bg-slate-950/95"
        label="Defense!"
        title={defenseBanner.title}
        subtitle={defenseBanner.subtitle}
        visible={defenseBanner.visible}
        slidingOut={defenseBannerSlidingOut}
      />
      <Banner
        top="top-56"
        border="border-rose-500"
        bg="bg-slate-950/95"
        label="Enemy Strike"
        title={enemyAttackBanner.title}
        subtitle={enemyAttackBanner.subtitle}
        visible={enemyAttackBanner.visible}
        slidingOut={enemyAttackBannerSlidingOut}
      />
      <Banner
        top="top-72"
        border="border-emerald-500"
        bg="bg-emerald-600/95"
        label="Enemy Defense"
        title={enemyDefenseBanner.title}
        subtitle={enemyDefenseBanner.subtitle}
        visible={enemyDefenseBanner.visible}
        slidingOut={enemyDefenseBannerSlidingOut}
        extra={
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-100 flex items-center justify-center gap-2 mt-2">
            <Shield className="h-3.5 w-3.5 text-slate-100" /> Enemy Defense
          </p>
        }
      />
    </>
  );
}

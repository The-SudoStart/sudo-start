import Image from 'next/image';

/**
 * A product screenshot from public/images/screenshots that follows the
 * active theme: `<name>-light.png` or `<name>-dark.png`.
 */
export function ProductShot({ name, alt }: { name: 'landing' | 'catalog' | 'script'; alt: string }) {
  return (
    <figure className="mt-5 overflow-hidden rounded-lg border border-border bg-background shadow-soft">
      <Image
        src={`/images/screenshots/${name}-light.png`}
        alt={alt}
        width={1440}
        height={900}
        sizes="(min-width: 1024px) 720px, 100vw"
        className="shot-light h-auto w-full"
      />
      <Image
        src={`/images/screenshots/${name}-dark.png`}
        alt={alt}
        width={1440}
        height={900}
        sizes="(min-width: 1024px) 720px, 100vw"
        className="shot-dark h-auto w-full"
      />
    </figure>
  );
}

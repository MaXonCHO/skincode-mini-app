import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Bookmark, Heart, Home, Search, Sparkles } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import type { Product, Shade } from "./types";
import { finishLabels } from "./data";

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`wordmark ${compact ? "wordmark--compact" : ""}`} aria-label="SkinCode">
      SKINCODE
      {compact && <span>BEAUTY IN BALANCE</span>}
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`primary-button ${className}`} {...props}>{children}</button>;
}

export function SecondaryButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`secondary-button ${className}`} {...props}>{children}</button>;
}

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass-card ${className}`}>{children}</div>;
}

export function Bottle({ product, size = "md" }: { product: Product; size?: "sm" | "md" | "lg" }) {
  if (product.image) {
    return (
      <img
        className={`product-photo product-photo--${size}`}
        src={product.image}
        alt=""
        width="1024"
        height="1536"
        loading="lazy"
      />
    );
  }

  return (
    <div className={`bottle bottle--${size} bottle--${product.bottle}`} aria-hidden="true">
      <span className="bottle__cap" />
      <span className="bottle__glass">
        <span className="bottle__liquid" />
        <span className="bottle__label">{product.brand}<small>{product.name}</small></span>
      </span>
    </div>
  );
}

export function CatalogBottle({ product, size = "md", alt = "" }: { product: Product; size?: "sm" | "md" | "lg"; alt?: string }) {
  return (
    <img
      className={`catalog-bottle catalog-bottle--${size}`}
      src={product.image ?? "/assets/skincode-foundation-catalog-ui.png"}
      alt={alt}
      width="1024"
      height="1536"
      loading={size === "lg" ? "eager" : "lazy"}
    />
  );
}

export function Swatch({ shade, selected = false, size = "md" }: { shade: Shade; selected?: boolean; size?: "sm" | "md" }) {
  return (
    <span className={`swatch swatch--${size} ${selected ? "is-selected" : ""}`} style={{ "--swatch": shade.swatch } as React.CSSProperties}>
      <span />
    </span>
  );
}

export function ProductRow({ product, selected, onClick }: { product: Product; selected: boolean; onClick: () => void }) {
  return (
    <button className={`product-row ${selected ? "is-selected" : ""}`} onClick={onClick} aria-pressed={selected}>
      <Bottle product={product} size="sm" />
      <span className="product-row__copy">
        <strong>{product.brand}</strong>
        <span>{product.name}</span>
        <small>{product.description}</small>
      </span>
      <span className="select-mark" aria-hidden="true">{selected ? "✓" : ""}</span>
    </button>
  );
}

export function ResultCard({ product, shade, saved, onSave, onOpen }: {
  product: Product;
  shade: Shade;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="result-card">
      <div className="result-card__visual">
        <span className="match-badge"><Sparkles size={12} /> Близкий оттенок</span>
        <button className={`icon-button save-button ${saved ? "is-saved" : ""}`} onClick={onSave} aria-label={saved ? "Убрать из сохранённого" : "Сохранить"}>
          <Heart size={20} fill={saved ? "currentColor" : "none"} />
        </button>
        <span className="glass-orb glass-orb--card" />
        <CatalogBottle product={product} size="lg" />
      </div>
      <div className="result-card__body">
        <small>{product.brand}</small>
        <h3>{product.name}</h3>
        <span className="shade-chip">{shade.code} · {shade.name}</span>
        <p>{finishLabels[product.finish]} финиш</p>
        <div className="result-card__footer">
          <strong>от {product.price.toLocaleString("ru-RU")} ₽</strong>
          <button className="round-arrow" onClick={onOpen} aria-label={`Открыть ${product.brand} ${product.name}`}>→</button>
        </div>
      </div>
    </article>
  );
}

export function BottomNavigation() {
  const location = useLocation();
  const shelfIsActive = location.pathname === "/my-shades" || location.pathname === "/saved";
  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      <NavLink to="/" end><Home size={22} /><span>Главная</span></NavLink>
      <NavLink to="/select"><Search size={22} /><span>Подбор</span></NavLink>
      <NavLink to="/my-shades" className={shelfIsActive ? "active" : undefined}><Bookmark size={22} /><span>Мои тона</span></NavLink>
    </nav>
  );
}

export function DemoNote({ children = "Оттенки, цены и наличие показаны для примера." }: { children?: ReactNode }) {
  return <p className="demo-note">{children}</p>;
}

export function ChoiceChip({ children, selected, onClick }: { children: ReactNode; selected: boolean; onClick: () => void }) {
  return <button className={`choice-chip ${selected ? "is-selected" : ""}`} onClick={onClick} aria-pressed={selected}>{children}</button>;
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <GlassCard className="empty-state">
      <span className="empty-state__icon">{icon}</span>
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </GlassCard>
  );
}

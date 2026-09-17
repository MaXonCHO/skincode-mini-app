import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Heart,
  Info,
  Plus,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import {
  Bottle,
  CatalogBottle,
  ChoiceChip,
  DemoNote,
  EmptyState,
  GlassCard,
  PrimaryButton,
  ProductRow,
  ResultCard,
  SecondaryButton,
  ShadeDrop,
  Swatch,
  Wordmark,
} from "./components";
import { findProductByShade, findShade, finishLabels, matches, products, stores } from "./data";
import { getRecommendations } from "./matching";
import { useAppStore } from "./store";
import type { Budget, Feedback, Finish, SkinType, ToneFit, ToneShift } from "./types";

function PageHeader({ step, right }: { step?: string; right?: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <header className="page-header">
      <button className="icon-button" onClick={() => navigate(-1)} aria-label="Назад"><ArrowLeft size={24} /></button>
      {step ? <span className="step-label">{step}</span> : <Wordmark compact />}
      <span className="page-header__right">{right}</span>
    </header>
  );
}

function getSourceSummary(sourceShadeId: string | null) {
  const product = findProductByShade(sourceShadeId);
  const shade = findShade(sourceShadeId);
  return { product, shade };
}

export function HomePage() {
  const navigate = useNavigate();
  const { saved } = useAppStore();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal-on-scroll"));
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -36px" });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="screen home-screen">
      <header className="home-header">
        <Wordmark />
        <button className="icon-button" onClick={() => navigate("/saved")} aria-label="Сохранённые подборки">
          <Bookmark size={23} fill={saved.length ? "currentColor" : "none"} />
        </button>
      </header>
      <div className="hero-copy">
        <p className="eyebrow">ПОДБОР БЕЗ ФОТО</p>
        <h1>Твой тон.<br />В новом флаконе.</h1>
      </div>
      <div className="hero-visual">
        <span className="foundation-stroke" />
        <img className="hero-product-image" src="/assets/skincode-foundation-hero-ui.png" alt="Флакон тонального средства в композиции из прозрачного стекла" width="600" height="900" />
      </div>
      <div className="sticky-actions home-actions">
        <PrimaryButton onClick={() => navigate("/select")}>Подобрать оттенок <ArrowRight size={19} /></PrimaryButton>
        <button className="text-button" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>Как это работает</button>
      </div>
      <div className="story-bridge reveal-on-scroll" aria-hidden="true"><span>От знакомого оттенка<br />к новому совпадению</span><i /></div>
      <section className="how-it-works reveal-on-scroll" id="how" aria-labelledby="how-title">
        <p className="eyebrow">ПРОСТОЙ ПУТЬ К СВОЕМУ ТОНУ</p>
        <h2 id="how-title">Как это работает?</h2>
        <div className="how-steps">
          <article className="how-step reveal-on-scroll">
            <span>01</span>
            <div><h3>Расскажи о своей коже</h3><p>Укажи подтон и тип кожи — это поможет точнее определить подходящее направление оттенка.</p></div>
          </article>
          <article className="how-step reveal-on-scroll reveal-delay-1">
            <span>02</span>
            <div><h3>Добавь свои тональные средства</h3><p>Выбери несколько знакомых средств и укажи оттенок каждого из них.</p></div>
          </article>
          <article className="how-step reveal-on-scroll reveal-delay-2">
            <span>03</span>
            <div><h3>Получи рекомендации</h3><p>Сравним твои эталоны с базой брендов и покажем наиболее близкие варианты.</p></div>
          </article>
        </div>
        <SecondaryButton onClick={() => navigate("/select")}>Начать подбор <ArrowRight size={18} /></SecondaryButton>
      </section>
      <section className="trust-numbers reveal-on-scroll" aria-labelledby="trust-title">
        <p className="eyebrow">СКИНКОД В ЦИФРАХ</p>
        <h2 id="trust-title">Цифры, которым доверяют</h2>
        <div className="trust-grid">
          <div><strong>50+</strong><span>брендов в базе</span></div>
          <div><strong>2 <small>мин</small></strong><span>до результата</span></div>
          <div><strong>5</strong><span>лучших мэтчей в подборке рекомендаций</span></div>
        </div>
      </section>
    </section>
  );
}

export function ProductSearchPage() {
  const navigate = useNavigate();
  const { sourceProductIds, toggleSourceProductId } = useAppStore();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.toLowerCase().trim();
  const popularProductIds = new Set(["mac-studio-fix", "3ina-every-single-day", "essence-stay-all-day", "payot-roselift-cc", "skincode-nude-serum"]);
  const filtered = normalizedQuery
    ? products.filter((product) => `${product.brand} ${product.name}`.toLowerCase().includes(normalizedQuery))
    : products.filter((product) => popularProductIds.has(product.id));
  const searchSuggestions = normalizedQuery ? filtered.slice(0, 4) : [];
  const brandHints = ["MAC", "3INA", "ESSENCE", "PAYOT"];

  return (
    <section className="screen flow-screen">
      <PageHeader step="Шаг 1 из 3" />
      <div className="title-block">
        <p className="eyebrow">ТВОЙ ЭТАЛОН</p>
        <h1>Чем ты пользуешься?</h1>
        <p>Выбери одно или несколько средств, которыми ты пользуешься.</p>
      </div>
      <label className="search-field">
        <span className="sr-only">Бренд или название</span>
        <Search size={20} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Бренд или название" autoFocus />
        {query && <button onClick={() => setQuery("")} aria-label="Очистить поиск">×</button>}
      </label>
      {normalizedQuery && searchSuggestions.length > 0 ? (
        <div className="search-suggestions" aria-label="Подсказки поиска">
          {searchSuggestions.map((product) => (
            <button key={product.id} onClick={() => setQuery(`${product.brand} ${product.name}`)}>
              <Bottle product={product} size="sm" />
              <span><strong>{product.brand}</strong><small>{product.name}</small></span>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
      ) : !normalizedQuery ? (
        <div className="search-hints" aria-label="Быстрый поиск по бренду">
          <span>Попробуй:</span>
          {brandHints.map((brand) => <button key={brand} onClick={() => setQuery(brand)}>{brand}</button>)}
        </div>
      ) : null}
      <p className="field-caption">{query ? `Найдено: ${filtered.length}` : "Популярные средства"}</p>
      <div className="product-list">
        {filtered.map((product) => (
          <ProductRow key={product.id} product={product} selected={sourceProductIds.includes(product.id)} onClick={() => toggleSourceProductId(product.id)} />
        ))}
      </div>
      {!filtered.length && (
        <EmptyState
          icon={<Search size={24} />}
          title="Ничего не нашли"
          text="Проверь написание или отправь название — это поможет расширить демо-каталог."
          action={<SecondaryButton onClick={() => navigate("/missing")}>Отправить название</SecondaryButton>}
        />
      )}
      <button className="text-button inline-link" onClick={() => navigate("/missing")}>Нет моего средства</button>
      <div className="sticky-actions">
        {sourceProductIds.length > 0 && <p className="selection-summary" aria-live="polite">Выбрано средств: <strong>{sourceProductIds.length}</strong></p>}
        <PrimaryButton disabled={!sourceProductIds.length} onClick={() => navigate("/shade")}>Выбрать оттенки <ArrowRight size={19} /></PrimaryButton>
      </div>
    </section>
  );
}

export function ShadeSelectPage() {
  const navigate = useNavigate();
  const { sourceProductIds, sourceShadeIds, setSourceShadeForProduct } = useAppStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedProducts = sourceProductIds.map((id) => products.find((item) => item.id === id)).filter((item): item is (typeof products)[number] => Boolean(item));
  const product = selectedProducts[activeIndex];
  const [focusedShadeId, setFocusedShadeId] = useState<string | null>(null);
  if (!product) return <MissingSelection />;
  const shades = product.shades;
  const selectedShadeId = sourceShadeIds[product.id] ?? null;
  const completedCount = selectedProducts.filter((item) => sourceShadeIds[item.id]).length;
  const allComplete = completedCount === selectedProducts.length;

  const selectProduct = (index: number) => {
    const nextProduct = selectedProducts[index];
    setActiveIndex(index);
    setFocusedShadeId(sourceShadeIds[nextProduct.id] ?? nextProduct.shades[0]?.id ?? null);
  };

  const focusShade = (shadeId: string) => {
    setFocusedShadeId(shadeId);
    window.requestAnimationFrame(() => document.getElementById(`shade-${shadeId}`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }));
  };

  const moveShade = (direction: -1 | 1) => {
    if (!shades.length) return;
    const currentId = focusedShadeId ?? selectedShadeId ?? shades[0].id;
    const currentIndex = Math.max(0, shades.findIndex((shade) => shade.id === currentId));
    const nextIndex = Math.min(shades.length - 1, Math.max(0, currentIndex + direction));
    focusShade(shades[nextIndex].id);
  };

  const continueFlow = () => {
    if (!selectedShadeId) return;
    if (activeIndex < selectedProducts.length - 1) selectProduct(activeIndex + 1);
    else if (allComplete) navigate("/fit");
  };

  return (
    <section className="screen flow-screen">
      <PageHeader step="Шаг 1 из 3" />
      <div className="title-block">
        <p className="eyebrow">ОТТЕНОК НА ФЛАКОНЕ</p>
        <h1>Какой у тебя оттенок?</h1>
        <p>Выбери оттенок отдельно для каждого средства.</p>
      </div>
      {selectedProducts.length > 1 && (
        <div className="product-stepper" role="tablist" aria-label="Выбранные средства">
          {selectedProducts.map((item, index) => (
            <button
              key={item.id}
              className={index === activeIndex ? "is-active" : ""}
              onClick={() => selectProduct(index)}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`${item.brand} ${item.name}${sourceShadeIds[item.id] ? ", оттенок выбран" : ""}`}
            >
              <Bottle product={item} size="sm" />
              <span>{index + 1}</span>
              {sourceShadeIds[item.id] && <Check size={14} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
      <div className="shade-progress"><span>Средство {activeIndex + 1} из {selectedProducts.length}</span><strong>{completedCount}/{selectedProducts.length} готово</strong></div>
      <GlassCard className="selected-product-card">
        <Bottle product={product} size="lg" />
        <div><strong>{product.brand}</strong><h3>{product.name}</h3><p>{product.description}</p></div>
      </GlassCard>
      <div className="shade-carousel-shell">
        <button className="carousel-arrow carousel-arrow--left" onClick={() => moveShade(-1)} aria-label="Предыдущий оттенок"><ChevronLeft size={22} /></button>
        <div className="shade-carousel" role="listbox" aria-label={`Оттенки ${product.brand} ${product.name}`}>
          {shades.map((shade) => (
            <button
              id={`shade-${shade.id}`}
              key={shade.id}
              className={`shade-option ${focusedShadeId === shade.id ? "is-focused" : ""}`}
              onFocus={() => setFocusedShadeId(shade.id)}
              onClick={() => { setSourceShadeForProduct(product.id, shade.id); focusShade(shade.id); }}
              role="option"
              aria-selected={selectedShadeId === shade.id}
            >
              <ShadeDrop shade={shade} selected={selectedShadeId === shade.id} />
              <strong>{shade.code}</strong>
              <small>{shade.name}</small>
              <span className="shade-check" aria-hidden="true">{selectedShadeId === shade.id ? <Check size={15} /> : null}</span>
            </button>
          ))}
        </div>
        <button className="carousel-arrow carousel-arrow--right" onClick={() => moveShade(1)} aria-label="Следующий оттенок"><ChevronRight size={22} /></button>
      </div>
      <div className="info-row"><Info size={18} /><span>Цвет мазка — только ориентир. Сверь код на упаковке.</span></div>
      <div className="sticky-actions">
        <PrimaryButton disabled={!selectedShadeId || (activeIndex === selectedProducts.length - 1 && !allComplete)} onClick={continueFlow}>
          {activeIndex < selectedProducts.length - 1 ? <>Следующее средство <ArrowRight size={19} /></> : <>Продолжить <ArrowRight size={19} /></>}
        </PrimaryButton>
      </div>
    </section>
  );
}

export function FitPage() {
  const navigate = useNavigate();
  const { sourceProductIds, sourceShadeIds, fit, shifts, setFit, toggleShift } = useAppStore();
  const references = sourceProductIds.map((productId) => {
    const product = products.find((item) => item.id === productId);
    const shade = findShade(sourceShadeIds[productId]);
    return product && shade ? { product, shade } : null;
  }).filter((item): item is { product: (typeof products)[number]; shade: NonNullable<ReturnType<typeof findShade>> } => Boolean(item));
  if (!references.length) return <MissingSelection />;
  const fits: [ToneFit, string][] = [["perfect", "Идеально"], ["lighter", "Светлее кожи"], ["darker", "Темнее кожи"]];
  const shiftOptions: [ToneShift, string][] = [["yellow", "Желтит"], ["pink", "Розовит"]];
  return (
    <section className="screen flow-screen">
      <PageHeader step="Шаг 2 из 3" />
      <div className="title-block">
        <p className="eyebrow">УТОЧНЯЕМ ЭТАЛОН</p>
        <h1>{references.length > 1 ? "Как они тебе подходят?" : "Как он тебе подходит?"}</h1>
        <p>Помоги понять, насколько хорошо {references.length > 1 ? "эти оттенки описывают" : "оттенок описывает"} твою кожу.</p>
      </div>
      <div className="reference-stack" aria-label="Выбранные тональные средства">
        {references.map(({ product, shade }) => (
          <GlassCard className="reference-card" key={product.id}>
            <Bottle product={product} size="md" />
            <div><strong>{product.brand}</strong><h3>{product.name}</h3><span className="shade-chip">{shade.code}</span></div>
            <Swatch shade={shade} size="sm" />
          </GlassCard>
        ))}
      </div>
      <fieldset>
        <legend>Как выглядит на твоей коже?</legend>
        <div className="chip-row">{fits.map(([value, label]) => <ChoiceChip key={value} selected={fit === value} onClick={() => setFit(value)}>{label}</ChoiceChip>)}</div>
      </fieldset>
      <fieldset>
        <legend>Есть ли цветовой сдвиг?</legend>
        <div className="chip-row">{shiftOptions.map(([value, label]) => <ChoiceChip key={value} selected={shifts.includes(value)} onClick={() => toggleShift(value)}>{label}</ChoiceChip>)}</div>
        <p className="helper-text">Можно отметить отдельно от основной оценки.</p>
      </fieldset>
      <button className="add-reference glass-card" onClick={() => navigate("/select")}><Plus size={22} /><div><strong>Изменить список средств</strong><p>Добавь или убери знакомые тональные средства.</p></div></button>
      <div className="sticky-actions">
        <PrimaryButton disabled={!fit} onClick={() => navigate("/preferences")}>Продолжить <ArrowRight size={19} /></PrimaryButton>
        <DemoNote>Подтверждённый оттенок — основа подбора.</DemoNote>
      </div>
    </section>
  );
}

export function PreferencesPage() {
  const navigate = useNavigate();
  const { sourceShadeIds, preferences, setPreferences } = useAppStore();
  const [matching, setMatching] = useState(false);

  const update = <K extends keyof typeof preferences>(key: K, value: (typeof preferences)[K]) => setPreferences({ ...preferences, [key]: value });
  const finish = () => {
    setMatching(true);
    window.setTimeout(() => {
      const selectedShadeIds = Object.values(sourceShadeIds);
      const hasMatches = matches.some((match) => selectedShadeIds.includes(match.sourceShadeId));
      navigate(hasMatches ? "/results" : "/no-match");
    }, 520);
  };
  return (
    <section className="screen flow-screen">
      <PageHeader step="Шаг 3 из 3" right={<button className="text-button" onClick={finish}>Пропустить</button>} />
      <div className="title-block">
        <p className="eyebrow">ФОРМУЛА И БЮДЖЕТ</p>
        <h1>Что важно в новом тоне?</h1>
        <p>Предпочтения уточнят формулу, но не заменят сравнение оттенков.</p>
      </div>
      <fieldset>
        <legend>Тип кожи</legend>
        <div className="chip-row">{([['dry','Сухая'],['oily','Жирная'],['combination','Комбинированная'],['unknown','Не знаю']] as [SkinType,string][]).map(([value,label]) => <ChoiceChip key={value} selected={preferences.skinType === value} onClick={() => update("skinType", value)}>{label}</ChoiceChip>)}</div>
      </fieldset>
      <fieldset>
        <legend>Финиш</legend>
        <div className="chip-row">{([['matte','Матовый'],['natural','Естественный'],['radiant','Сияющий']] as [Finish,string][]).map(([value,label]) => <ChoiceChip key={value} selected={preferences.finish === value} onClick={() => update("finish", value)}>{label}</ChoiceChip>)}</div>
      </fieldset>
      <fieldset>
        <legend>Бюджет</legend>
        <div className="chip-row">{([['any','Любой'],['3000','До 3 000 ₽'],['5000','До 5 000 ₽']] as [Budget,string][]).map(([value,label]) => <ChoiceChip key={value} selected={preferences.budget === value} onClick={() => update("budget", value)}>{label}</ChoiceChip>)}</div>
      </fieldset>
      <div className="preference-art" aria-hidden="true"><span className="foundation-stroke" /><span>ПРАВИЛЬНЫЙ ТОН —<br />УВЕРЕННОСТЬ КАЖДЫЙ ДЕНЬ</span></div>
      <div className="sticky-actions">
        <PrimaryButton onClick={finish} disabled={matching}>{matching ? <><span className="spinner" /> Сопоставляем оттенки</> : <>Показать варианты <Sparkles size={18} /></>}</PrimaryButton>
      </div>
    </section>
  );
}

function useRecommendations() {
  const { sourceProductIds, sourceShadeIds, preferences } = useAppStore();
  const orderedShadeIds = sourceProductIds.map((productId) => sourceShadeIds[productId]).filter(Boolean);
  return getRecommendations(orderedShadeIds, preferences);
}

export function ResultsPage() {
  const navigate = useNavigate();
  const { sourceProductIds, sourceShadeId, saved, toggleSaved } = useAppStore();
  const [filter, setFilter] = useState<"all" | "available" | "budget">("all");
  const recommendations = useRecommendations();
  const shown = recommendations.filter((item) => filter === "all" || (filter === "available" ? item.product.available : item.product.price <= 3000));
  const { product: sourceProduct, shade: sourceShade } = getSourceSummary(sourceShadeId);
  if (!sourceProduct || !sourceShade) return <MissingSelection />;
  return (
    <section className="screen results-screen">
      <header className="simple-top"><button className="icon-button" onClick={() => navigate("/preferences")} aria-label="Назад"><ArrowLeft size={24} /></button><Wordmark compact /><span /></header>
      <div className="title-block compact-title"><p className="eyebrow">ПРЕДВАРИТЕЛЬНЫЕ ВАРИАНТЫ</p><h1>Твои новые тона</h1><p>{sourceProductIds.length > 1 ? `На основе ${sourceProductIds.length} знакомых средств` : `На основе ${sourceProduct.brand} ${sourceProduct.name} ${sourceShade.code}`}</p></div>
      <button className="source-strip" onClick={() => navigate("/shade")}>
        <Bottle product={sourceProduct} size="sm" /><span><small>{sourceProductIds.length > 1 ? "Твои эталоны" : "Твой эталон"}</small><strong>{sourceProduct.brand} {sourceShade.code}{sourceProductIds.length > 1 ? ` · ещё ${sourceProductIds.length - 1}` : ""}</strong></span><ChevronRight size={20} />
      </button>
      <div className="filter-row" aria-label="Фильтры результата">
        <ChoiceChip selected={filter === "all"} onClick={() => setFilter("all")}>Все</ChoiceChip>
        <ChoiceChip selected={filter === "available"} onClick={() => setFilter("available")}>В наличии</ChoiceChip>
        <ChoiceChip selected={filter === "budget"} onClick={() => setFilter("budget")}>До 3 000 ₽</ChoiceChip>
      </div>
      {shown.length ? (
        <div className="results-grid">{shown.map(({ product, shade }) => <ResultCard key={shade.id} product={product} shade={shade} saved={saved.includes(shade.id)} onSave={() => toggleSaved(shade.id)} onOpen={() => navigate(`/product/${shade.id}`)} />)}</div>
      ) : (
        <EmptyState icon={<Sparkles size={24} />} title="Нет вариантов с этим фильтром" text="Попробуй показать все варианты или изменить предпочтения." action={<SecondaryButton onClick={() => setFilter("all")}>Сбросить фильтр</SecondaryButton>} />
      )}
      <DemoNote />
    </section>
  );
}

export function ProductPage() {
  const navigate = useNavigate();
  const { shadeId } = useParams();
  const { sourceShadeId, saved, toggleSaved } = useAppStore();
  const product = findProductByShade(shadeId);
  const shade = findShade(shadeId);
  const sourceShade = findShade(sourceShadeId);
  const sourceProduct = findProductByShade(sourceShadeId);
  const match = matches.find((item) => item.sourceShadeId === sourceShadeId && item.targetShadeId === shadeId);
  if (!product || !shade) return <MissingSelection />;
  const isSaved = saved.includes(shade.id);
  return (
    <section className="screen detail-screen">
      <PageHeader right={<button className={`icon-button ${isSaved ? "is-saved" : ""}`} onClick={() => toggleSaved(shade.id)} aria-label="Сохранить"><Heart size={23} fill={isSaved ? "currentColor" : "none"} /></button>} />
      <div className="detail-hero">
        <span className="glass-loop" /><span className="glass-orb glass-orb--two" />
        <CatalogBottle product={product} size="lg" alt={`${product.brand} ${product.name}, оттенок ${shade.code}`} />
        <span className="vertical-caption">ЕСТЕСТВЕННАЯ КРАСОТА<br />В ТВОЁМ РИТМЕ</span>
      </div>
      <div className="detail-content">
        <p className="eyebrow">{product.brand}</p><h1>{product.name}</h1><span className="shade-chip">{shade.code} · {shade.name}</span>
        <h2>Почему этот вариант</h2>
        <ul className="reason-list"><li><Sparkles size={18} />{match?.explanation ?? "Предварительный вариант по демонстрационной таблице"}</li><li><Check size={18} />{finishLabels[product.finish]} финиш</li></ul>
        {sourceShade && sourceProduct && <GlassCard className="comparison-card"><div><Swatch shade={sourceShade} /><span><small>Твой тон</small><strong>{sourceProduct.brand} {sourceShade.code}</strong></span></div><ArrowRight size={20} /><div><Swatch shade={shade} /><span><small>Новый</small><strong>{product.brand} {shade.code}</strong></span></div></GlassCard>}
        <div className="daylight-note"><Sun size={20} /><span>Проверь оттенок при дневном свете.</span></div>
        <div className="detail-actions"><PrimaryButton onClick={() => navigate(`/stores/${shade.id}`)}>Где купить</PrimaryButton><SecondaryButton onClick={() => toggleSaved(shade.id)}>{isSaved ? <><Check size={18} /> Сохранено</> : <><Bookmark size={18} /> Сохранить</>}</SecondaryButton></div>
      </div>
    </section>
  );
}

export function StoresPage() {
  const navigate = useNavigate();
  const { shadeId } = useParams();
  const product = findProductByShade(shadeId);
  const shade = findShade(shadeId);
  const [toast, setToast] = useState(false);
  if (!product || !shade) return <MissingSelection />;
  const notify = () => { setToast(true); window.setTimeout(() => setToast(false), 3200); };
  return (
    <section className="screen flow-screen store-screen">
      <PageHeader />
      <div className="title-block"><p className="eyebrow">ДЕМО-МАГАЗИНЫ</p><h1>Где купить</h1><p>Выбери предложение для оттенка {shade.code}.</p></div>
      <GlassCard className="store-product"><CatalogBottle product={product} size="md" /><div><strong>{product.brand}</strong><h3>{product.name}</h3><span className="shade-chip">{shade.code} · {shade.name}</span></div></GlassCard>
      <h2 className="section-title">Выбери магазин</h2>
      <div className="store-list">{stores.map((store, index) => (
        <GlassCard className="store-row" key={store.id}><span className="store-logo">{String.fromCharCode(65 + index)}</span><div><strong>{store.name}</strong><b>{(product.price + store.priceDelta).toLocaleString("ru-RU")} ₽</b><small className={store.available ? "stock" : "muted"}>{store.available ? "● В наличии" : "Нет в наличии"}</small></div><button onClick={notify} disabled={!store.available}>Перейти <ExternalLink size={16} /></button></GlassCard>
      ))}</div>
      <div className="info-row"><Info size={20} /><span>Откроется страница выбранного оттенка в магазине.</span></div>
      <DemoNote>Цены и наличие демонстрационные и могут отличаться в реальности.</DemoNote>
      {toast && <div className="toast" role="status"><Check size={18} /> В прототипе внешняя ссылка не открывается</div>}
    </section>
  );
}

export function MyShadesPage() {
  const navigate = useNavigate();
  const { sourceShadeId, resetMatch, saved } = useAppStore();
  const { product, shade } = getSourceSummary(sourceShadeId);
  return (
    <section className="screen shelf-screen">
      <header className="centered-header"><Wordmark compact /></header>
      <div className="title-block compact-title"><p className="eyebrow">ТВОЯ ТОНАЛЬНАЯ ПОЛКА</p><h1>Мои тона</h1><p>Сохраняй эталоны и возвращайся к подборке в любое время.</p></div>
      <div className="segmented"><button className="is-active">Мои средства</button><button onClick={() => navigate("/saved")}>Сохранённое {saved.length ? `· ${saved.length}` : ""}</button></div>
      {product && shade ? <GlassCard className="shelf-card"><div><span className="status-chip"><Check size={13} /> Подходит идеально</span><h2>Мой эталон</h2><h3>{product.brand}<br />{product.name}<br />{shade.code}</h3><p>{product.description}</p><SecondaryButton onClick={() => navigate("/select")}><Plus size={18} /> Добавить средство</SecondaryButton></div><CatalogBottle product={product} size="lg" /></GlassCard> : <EmptyState icon={<CircleHelp size={24} />} title="Эталон пока не выбран" text="Начни подбор с тонального средства, которое уже подходит." action={<PrimaryButton onClick={() => navigate("/select")}>Выбрать эталон</PrimaryButton>} />}
      <GlassCard className="season-card"><Sun size={24} /><div><strong>Сезонный вариант</strong><p>Сохрани отдельный оттенок для загара.</p></div><button aria-label="Добавить сезонный вариант"><ArrowRight size={20} /></button></GlassCard>
      <PrimaryButton onClick={() => { resetMatch(); navigate("/select"); }}>Подобрать новый тон <ArrowRight size={18} /></PrimaryButton>
    </section>
  );
}

export function SavedPage() {
  const navigate = useNavigate();
  const { saved, toggleSaved, sourceShadeId } = useAppStore();
  const sourceProduct = findProductByShade(sourceShadeId);
  const sourceShade = findShade(sourceShadeId);
  const [toast, setToast] = useState(false);
  const savedItems = saved.map((id) => ({ product: findProductByShade(id), shade: findShade(id) })).filter((item) => item.product && item.shade);
  return (
    <section className="screen saved-screen">
      <header className="centered-header"><Wordmark compact /></header>
      <div className="title-block compact-title"><p className="eyebrow">ТВОЯ ПОДБОРКА</p><h1>Можно вернуться позже</h1><p>Сохранённые варианты всегда под рукой — без регистрации.</p></div>
      {savedItems.length ? <div className="saved-list">{savedItems.map(({ product, shade }) => product && shade && <GlassCard className="saved-card" key={shade.id}><CatalogBottle product={product} size="md" /><div><small>{product.brand}</small><h3>{product.name}</h3><strong>{shade.code}</strong><p>{product.description}</p><button className="text-button" onClick={() => navigate(`/feedback/${shade.id}`)}>Оставить отзыв</button></div><button className="icon-button" onClick={() => toggleSaved(shade.id)} aria-label="Удалить из сохранённого"><Bookmark size={20} fill="currentColor" /></button></GlassCard>)}</div> : <EmptyState icon={<Bookmark size={24} />} title="Здесь пока пусто" text="Сохраняй понравившиеся варианты из результатов подбора." action={<PrimaryButton onClick={() => navigate(sourceShadeId ? "/results" : "/select")}>Перейти к подбору</PrimaryButton>} />}
      {sourceProduct && sourceShade && <div className="basis-strip"><Swatch shade={sourceShade} size="sm" /><span>Основа: <strong>{sourceProduct.brand} {sourceShade.code}</strong></span></div>}
      <SecondaryButton disabled={!savedItems.length} onClick={() => { setToast(true); window.setTimeout(() => setToast(false), 2600); }}><Share2 size={18} /> Поделиться ссылкой</SecondaryButton>
      {toast && <div className="toast" role="status"><Check size={18} /> Демо-ссылка скопирована</div>}
    </section>
  );
}

export function FeedbackPage() {
  const navigate = useNavigate();
  const { shadeId } = useParams();
  const { feedback, setFeedback } = useAppStore();
  const product = findProductByShade(shadeId);
  const shade = findShade(shadeId);
  const existing = shadeId ? feedback[shadeId] : undefined;
  const [form, setForm] = useState<Feedback>(existing ?? { tried: false, color: "matched", formula: "liked" });
  const [saved, setSaved] = useState(false);
  if (!product || !shade || !shadeId) return <MissingSelection />;
  const submit = () => { setFeedback(shadeId, form); setSaved(true); window.setTimeout(() => navigate("/saved"), 700); };
  return (
    <section className="screen feedback-screen">
      <PageHeader />
      <div className="title-block"><p className="eyebrow">ПОМОГИ УЛУЧШИТЬ ПОДБОР</p><h1>Подошёл ли оттенок?</h1><p>Отзыв сохраняется только на этом устройстве.</p></div>
      <div className="feedback-visual"><span className="foundation-stroke" /><CatalogBottle product={product} size="lg" /><div><strong>{product.brand}</strong><span>{product.name} {shade.code}</span></div></div>
      <fieldset><legend>Ты уже попробовала?</legend><div className="chip-row"><ChoiceChip selected={!form.tried} onClick={() => setForm({ ...form, tried: false })}>Ещё не пробовала</ChoiceChip><ChoiceChip selected={form.tried} onClick={() => setForm({ ...form, tried: true })}>Уже попробовала</ChoiceChip></div></fieldset>
      <fieldset><legend>По цвету</legend><div className="chip-row">{([['matched','Подошёл'],['lighter','Светлее'],['darker','Темнее'],['yellow','Желтит'],['pink','Розовит']] as [Feedback['color'],string][]).map(([value,label]) => <ChoiceChip key={value} selected={form.color === value} onClick={() => setForm({ ...form, color: value })}>{label}</ChoiceChip>)}</div></fieldset>
      <fieldset><legend>По формуле</legend><div className="chip-row"><ChoiceChip selected={form.formula === "liked"} onClick={() => setForm({ ...form, formula: "liked" })}>Понравилась</ChoiceChip><ChoiceChip selected={form.formula === "disliked"} onClick={() => setForm({ ...form, formula: "disliked" })}>Не подошла</ChoiceChip></div></fieldset>
      <PrimaryButton onClick={submit}>{saved ? <><Check size={18} /> Отзыв сохранён</> : "Сохранить отзыв"}</PrimaryButton>
    </section>
  );
}

export function NoMatchPage() {
  const navigate = useNavigate();
  return (
    <section className="screen no-match-screen">
      <PageHeader />
      <div className="title-block"><p className="eyebrow">ЧЕСТНЫЙ РЕЗУЛЬТАТ</p><h1>Пока мало данных</h1><p>Для этого оттенка ещё нет надёжного демонстрационного сопоставления.</p></div>
      <div className="no-match-visual"><Bottle product={products[3]} size="lg" /><span>•••</span><Bottle product={products[4]} size="lg" /></div>
      <PrimaryButton onClick={() => navigate("/select")}><Plus size={18} /> Добавить другой эталон</PrimaryButton>
      <SecondaryButton onClick={() => navigate("/select")}><Search size={18} /> Проверить название средства</SecondaryButton>
      <GlassCard className="missing-card"><Send size={22} /><div><strong>Нет твоего средства?</strong><p>Отправь название — мы постараемся добавить его в базу.</p><button className="text-button" onClick={() => navigate("/missing")}>Отправить название</button></div></GlassCard>
      <div className="trust-note"><ShieldCheck size={21} /><span>Мы не показываем случайный оттенок как точное совпадение.</span></div>
    </section>
  );
}

export function MissingProductPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section className="screen flow-screen">
      <PageHeader />
      <div className="title-block"><p className="eyebrow">ПОМОГИ РАСШИРИТЬ БАЗУ</p><h1>Какого средства не хватает?</h1><p>В прототипе название сохранится только локально и никуда не отправится.</p></div>
      <label className="form-field"><span>Бренд и название</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Armani Luminous Silk" /></label>
      <PrimaryButton disabled={!name.trim() || sent} onClick={() => { localStorage.setItem("skincode-missing-product", name.trim()); setSent(true); }}>{sent ? <><Check size={18} /> Название сохранено</> : <><Send size={18} /> Отправить название</>}</PrimaryButton>
      {sent && <SecondaryButton onClick={() => navigate("/select")}>Вернуться к каталогу</SecondaryButton>}
    </section>
  );
}

function MissingSelection() {
  const navigate = useNavigate();
  return <section className="screen flow-screen"><PageHeader /><EmptyState icon={<CircleHelp size={26} />} title="Сначала выбери эталон" text="Нам нужны знакомое средство и его оттенок, чтобы продолжить." action={<PrimaryButton onClick={() => navigate("/select")}>Начать подбор</PrimaryButton>} /></section>;
}

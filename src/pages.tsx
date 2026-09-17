import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
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
        <p>Подберём новое средство по оттенку, который тебе уже подходит.</p>
      </div>
      <div className="hero-visual">
        <span className="foundation-stroke" />
        <img className="hero-product-image" src="/assets/skincode-foundation-hero-ui.png" alt="Флакон тонального средства в композиции из прозрачного стекла" width="600" height="900" />
        <span className="hero-tag">БЕЗ СКАНИРОВАНИЯ<br />И ЦВЕТОТЕСТОВ</span>
      </div>
      <div className="sticky-actions home-actions">
        <PrimaryButton onClick={() => navigate("/select")}>Подобрать оттенок <ArrowRight size={19} /></PrimaryButton>
        <button className="text-button" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>Как это работает</button>
      </div>
      <GlassCard className="how-card">
        <span className="section-index">01</span>
        <div id="how">
          <strong>Выбери знакомое средство</strong>
          <p>Мы сравним его оттенок с локальной базой демонстрационных соответствий.</p>
        </div>
      </GlassCard>
    </section>
  );
}

export function ProductSearchPage() {
  const navigate = useNavigate();
  const { sourceProductId, setSourceProductId } = useAppStore();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.toLowerCase().trim();
  const popularProductIds = new Set(["mac-studio-fix", "3ina-every-single-day", "essence-stay-all-day", "payot-roselift-cc", "skincode-nude-serum"]);
  const filtered = normalizedQuery
    ? products.filter((product) => `${product.brand} ${product.name}`.toLowerCase().includes(normalizedQuery))
    : products.filter((product) => popularProductIds.has(product.id));

  return (
    <section className="screen flow-screen">
      <PageHeader step="Шаг 1 из 3" />
      <div className="title-block">
        <p className="eyebrow">ТВОЙ ЭТАЛОН</p>
        <h1>Чем ты пользуешься?</h1>
        <p>Найди своё тональное средство в списке.</p>
      </div>
      <label className="search-field">
        <span className="sr-only">Бренд или название</span>
        <Search size={20} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Бренд или название" autoFocus />
        {query && <button onClick={() => setQuery("")} aria-label="Очистить поиск">×</button>}
      </label>
      <p className="field-caption">{query ? `Найдено: ${filtered.length}` : "Популярные средства"}</p>
      <div className="product-list">
        {filtered.map((product) => (
          <ProductRow key={product.id} product={product} selected={sourceProductId === product.id} onClick={() => setSourceProductId(product.id)} />
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
        <PrimaryButton disabled={!sourceProductId} onClick={() => navigate("/shade")}>Выбрать оттенок <ArrowRight size={19} /></PrimaryButton>
      </div>
    </section>
  );
}

export function ShadeSelectPage() {
  const navigate = useNavigate();
  const { sourceProductId, sourceShadeId, setSourceShadeId } = useAppStore();
  const [query, setQuery] = useState("");
  const product = products.find((item) => item.id === sourceProductId);
  if (!product) return <MissingSelection />;
  const shades = product.shades.filter((shade) => shade.code.toLowerCase().includes(query.toLowerCase().trim()));

  return (
    <section className="screen flow-screen">
      <PageHeader step="Шаг 1 из 3" />
      <div className="title-block">
        <p className="eyebrow">ОТТЕНОК НА ФЛАКОНЕ</p>
        <h1>Какой у тебя оттенок?</h1>
        <p>Выбирай номер на флаконе, а не цвет на экране.</p>
      </div>
      <GlassCard className="selected-product-card">
        <Bottle product={product} size="md" />
        <div><strong>{product.brand}</strong><h3>{product.name}</h3><p>{product.description}</p></div>
      </GlassCard>
      <label className="search-field">
        <span className="sr-only">Код оттенка</span>
        <Search size={20} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск оттенка, например NC20" />
      </label>
      <div className="shade-grid" role="list" aria-label="Доступные оттенки">
        {shades.map((shade) => (
          <button key={shade.id} className="shade-option" onClick={() => setSourceShadeId(shade.id)} aria-pressed={sourceShadeId === shade.id}>
            <Swatch shade={shade} selected={sourceShadeId === shade.id} />
            <strong>{shade.code}</strong>
            <small>{shade.name}</small>
          </button>
        ))}
      </div>
      <div className="info-row"><Info size={18} /><span>Цвет кружка — только ориентир. Сверь код на упаковке.</span></div>
      <div className="sticky-actions">
        <PrimaryButton disabled={!sourceShadeId} onClick={() => navigate("/fit")}>Продолжить <ArrowRight size={19} /></PrimaryButton>
      </div>
    </section>
  );
}

export function FitPage() {
  const navigate = useNavigate();
  const { sourceShadeId, fit, shifts, setFit, toggleShift } = useAppStore();
  const { product, shade } = getSourceSummary(sourceShadeId);
  if (!product || !shade) return <MissingSelection />;
  const fits: [ToneFit, string][] = [["perfect", "Идеально"], ["lighter", "Светлее кожи"], ["darker", "Темнее кожи"]];
  const shiftOptions: [ToneShift, string][] = [["yellow", "Желтит"], ["pink", "Розовит"]];
  return (
    <section className="screen flow-screen">
      <PageHeader step="Шаг 2 из 3" />
      <div className="title-block">
        <p className="eyebrow">УТОЧНЯЕМ ЭТАЛОН</p>
        <h1>Как он тебе подходит?</h1>
        <p>Помоги понять, насколько хорошо оттенок тебя описывает.</p>
      </div>
      <GlassCard className="reference-card">
        <Bottle product={product} size="md" />
        <div><strong>{product.brand}</strong><h3>{product.name}</h3><span className="shade-chip">{shade.code}</span></div>
        <Swatch shade={shade} size="sm" />
      </GlassCard>
      <fieldset>
        <legend>Как выглядит на твоей коже?</legend>
        <div className="chip-row">{fits.map(([value, label]) => <ChoiceChip key={value} selected={fit === value} onClick={() => setFit(value)}>{label}</ChoiceChip>)}</div>
      </fieldset>
      <fieldset>
        <legend>Есть ли цветовой сдвиг?</legend>
        <div className="chip-row">{shiftOptions.map(([value, label]) => <ChoiceChip key={value} selected={shifts.includes(value)} onClick={() => toggleShift(value)}>{label}</ChoiceChip>)}</div>
        <p className="helper-text">Можно отметить отдельно от основной оценки.</p>
      </fieldset>
      <GlassCard className="add-reference"><Plus size={22} /><div><strong>Добавить ещё средство</strong><p>В прототипе используем один эталон — этого достаточно для демо.</p></div></GlassCard>
      <div className="sticky-actions">
        <PrimaryButton disabled={!fit} onClick={() => navigate("/preferences")}>Продолжить <ArrowRight size={19} /></PrimaryButton>
        <DemoNote>Подтверждённый оттенок — основа подбора.</DemoNote>
      </div>
    </section>
  );
}

export function PreferencesPage() {
  const navigate = useNavigate();
  const { sourceShadeId, preferences, setPreferences } = useAppStore();
  const [matching, setMatching] = useState(false);

  const update = <K extends keyof typeof preferences>(key: K, value: (typeof preferences)[K]) => setPreferences({ ...preferences, [key]: value });
  const finish = () => {
    setMatching(true);
    window.setTimeout(() => {
      const hasMatches = matches.some((match) => match.sourceShadeId === sourceShadeId);
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
  const { sourceShadeId, preferences } = useAppStore();
  return getRecommendations(sourceShadeId, preferences);
}

export function ResultsPage() {
  const navigate = useNavigate();
  const { sourceShadeId, saved, toggleSaved } = useAppStore();
  const [filter, setFilter] = useState<"all" | "available" | "budget">("all");
  const recommendations = useRecommendations();
  const shown = recommendations.filter((item) => filter === "all" || (filter === "available" ? item.product.available : item.product.price <= 3000));
  const { product: sourceProduct, shade: sourceShade } = getSourceSummary(sourceShadeId);
  if (!sourceProduct || !sourceShade) return <MissingSelection />;
  return (
    <section className="screen results-screen">
      <header className="simple-top"><button className="icon-button" onClick={() => navigate("/preferences")} aria-label="Назад"><ArrowLeft size={24} /></button><Wordmark compact /><span /></header>
      <div className="title-block compact-title"><p className="eyebrow">ПРЕДВАРИТЕЛЬНЫЕ ВАРИАНТЫ</p><h1>Твои новые тона</h1><p>На основе {sourceProduct.brand} {sourceProduct.name} {sourceShade.code}</p></div>
      <button className="source-strip" onClick={() => navigate("/shade")}>
        <Bottle product={sourceProduct} size="sm" /><span><small>Твой эталон</small><strong>{sourceProduct.brand} {sourceShade.code}</strong></span><ChevronRight size={20} />
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

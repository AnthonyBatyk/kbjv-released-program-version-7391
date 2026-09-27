document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const PRODUCTS_KEY = "kbjv_products";
  const CALCULATOR_KEY = "kbjv_calculator";
  const ARCHIVE_KEY = "kbjv_archive";
  const ACTIVE_TAB_KEY = "kbjv_active_tab";
  const CALCULATOR_DRAFT_KEY = "kbjv_calculator_draft";
  const SORT_KEY = "kbjv_product_sort";
  const CONSOLE_KEY = "kbjv_console";
  const EXPORT_VERSION_KEY = "kbjv_export_version";
  const DATABASE_UPDATED_KEY = "kbjv_database_updated_at";
  const EXPORT_FINGERPRINT_KEY = "kbjv_export_fingerprint";
  const DAILY_GOAL_KEY = "kbjv_daily_goal";
  const LAST_EXPORT_KEY = "kbjv_last_export_at";
  const LAST_IMPORT_KEY = "kbjv_last_import_at";
  const UNDO_KEY = "kbjv_undo_snapshot";
  const MEDICINES_KEY = "kbjv_medicines";
  const MEDICINE_ARCHIVE_KEY = "kbjv_medicine_archive";
  const MEDICINE_BUY_KEY = "kbjv_medicine_buy";

  let products = [];
  let calculatorItems = [];
  let archiveItems = [];
  let selectedProduct = null;
  let editingProduct = null;
  let draggedCard = null;
  let reorderMode = false;
  let reorderChanged = false;
  let archiveEditingId = null;
  let archiveOriginalText = null;
  let currentSort = localStorage.getItem(SORT_KEY) || "manual";
  let sortTarget = "blocks";
  let consoleItems = [];
  let draggedCalcIndex = null;
  let calculatorReorderMode = false;
  let calculatorReorderChanged = false;
  let medicines = [];
  let medicineArchive = [];
  let medicineBuy = [];
  let dailyGoal = {enabled:false,kcal:0,protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0};
  let dailyGoalSettingsOpen = false;
  let pendingExport = null;
  let exportScope = "all";
  let pendingImport = null;
  let importScope = "all";

  const $ = id => document.getElementById(id);
  const tabs = document.querySelectorAll(".tab");
  const pages = document.querySelectorAll(".page");
  const grid = $("grid");
  const searchInput = $("search");
  const clearSearch = $("clear-search");
  const exportButton = $("export-products");
  const importButton = $("import-products");
  const importFile = $("import-file");
  const addProductButton = $("add-product");
  const deleteProductButton = $("delete-product");
  const reorderProductsButton = $("reorder-products");
  const sortProductsButton = $("sort-products");

  const productModal = $("product-modal");
  const productModalName = $("product-modal-name");
  const productWeight = $("product-weight");
  const productCancel = $("product-cancel");
  const productCopy = $("product-copy");
  const productCalculator = $("product-calculator");

  const addProductModal = $("add-product-modal");
  const addProductCancel = $("add-product-cancel");
  const addProductSave = $("add-product-save");
  const newProductName = $("new-product-name");
  const newProductKcal = $("new-product-kcal");
  const newProductKcalNoData = $("new-product-kcal-no-data");
  const newProductProtein = $("new-product-protein");
  const newProductProteinNoData = $("new-product-protein-no-data");
  const newProductFat = $("new-product-fat");
  const newProductFatNoData = $("new-product-fat-no-data");
  const newProductCarb = $("new-product-carb");
  const newProductCarbNoData = $("new-product-carb-no-data");
  const newProductSugar = $("new-product-sugar");
  const newProductSugarNoData = $("new-product-sugar-no-data");
  const newProductSalt = $("new-product-salt");
  const newProductSaltNoData = $("new-product-salt-no-data");
  const newProductFiber = $("new-product-fiber");
  const newProductFiberNoData = $("new-product-fiber-no-data");
  const newProductDescription = $("new-product-description");
  const newProductDescriptionNoData = $("new-product-description-no-data");

  const editProductModal = $("edit-product-modal");
  const editProductCancel = $("edit-product-cancel");
  const editProductSave = $("edit-product-save");
  const editProductName = $("edit-product-name");
  const editProductKcal = $("edit-product-kcal");
  const editProductKcalNoData = $("edit-product-kcal-no-data");
  const editProductProtein = $("edit-product-protein");
  const editProductProteinNoData = $("edit-product-protein-no-data");
  const editProductFat = $("edit-product-fat");
  const editProductFatNoData = $("edit-product-fat-no-data");
  const editProductCarb = $("edit-product-carb");
  const editProductCarbNoData = $("edit-product-carb-no-data");
  const editProductSugar = $("edit-product-sugar");
  const editProductSugarNoData = $("edit-product-sugar-no-data");
  const editProductSalt = $("edit-product-salt");
  const editProductSaltNoData = $("edit-product-salt-no-data");
  const editProductFiber = $("edit-product-fiber");
  const editProductFiberNoData = $("edit-product-fiber-no-data");
  const editProductDescription = $("edit-product-description");
  const editProductDescriptionNoData = $("edit-product-description-no-data");

  const sortProductsModal = $("sort-products-modal");
  const sortOldest = $("sort-oldest");
  const sortNewest = $("sort-newest");
  const sortProductsCancel = $("sort-products-cancel");

  const deleteProductModal = $("delete-product-modal");
  const deleteProductList = $("delete-product-list");
  const deleteProductCancelTop = $("delete-product-cancel-top");
  const deleteProductCancelBottom = $("delete-product-cancel-bottom");
  const deleteSortProducts = $("delete-sort-products");

  const calcInput = $("calc-input");
  const calcAdd = $("calc-add");
  const calcClearText = $("calc-clear-text");
  const calcClearBlocks = $("calc-clear-blocks");
  const calcSection = $("calc-section");
  const kcalElement = $("kcal");
  const proteinElement = $("protein");
  const fatElement = $("fat");
  const carbElement = $("carb");
  const sugarElement = $("sugar");
  const saltElement = $("salt");
  const fiberElement = $("fiber");
  const copyTotal = $("copy-total");
  const saveArchive = $("save-archive");
  const reorderCalculatorHistory = $("reorder-calculator-history");
  const calcLog = $("calc-log");
  const archiveLog = $("archive-log");
  const siteProductsCount = $("site-products-count");
  const siteArchiveCount = $("site-archive-count");
  const siteDatabaseUpdated = $("site-database-updated");
  const siteCurrentDate = $("site-current-date");
  const siteLastExport = $("site-last-export");
  const siteLastImport = $("site-last-import");
  const dailyGoalToggle = $("daily-goal-toggle");
  const dailyGoalContent = $("daily-goal-content");
  const dailyGoalSettings = $("daily-goal-settings");
  const dailyGoalDetailsToggle = $("daily-goal-details-toggle");
  const dailyGoalCopyRemaining = $("daily-goal-copy-remaining");
  const dailyGoalSave = $("daily-goal-save");
  const goalInputs = {kcal:$("goal-kcal"),protein:$("goal-protein"),fat:$("goal-fat"),carb:$("goal-carb"),sugar:$("goal-sugar"),salt:$("goal-salt"),fiber:$("goal-fiber")};
  const remainElements = {kcal:$("remain-kcal"),protein:$("remain-protein"),fat:$("remain-fat"),carb:$("remain-carb"),sugar:$("remain-sugar"),salt:$("remain-salt"),fiber:$("remain-fiber")};
  const progressElements = {kcal:$("progress-kcal"),protein:$("progress-protein"),fat:$("progress-fat"),carb:$("progress-carb"),sugar:$("progress-sugar"),salt:$("progress-salt"),fiber:$("progress-fiber")};
  const progressLabels = {kcal:$("progress-label-kcal"),protein:$("progress-label-protein"),fat:$("progress-label-fat"),carb:$("progress-label-carb"),sugar:$("progress-label-sugar"),salt:$("progress-label-salt"),fiber:$("progress-label-fiber")};
  const exportPreviewModal = $("export-preview-modal");
  const exportPreviewProducts = $("export-preview-products");
  const exportPreviewArchive = $("export-preview-archive");
  const exportPreviewGoal = $("export-preview-goal");
  const exportPreviewVersion = $("export-preview-version");
  const exportPreviewDate = $("export-preview-date");
  const exportPreviewCancel = $("export-preview-cancel");
  const exportPreviewConfirm = $("export-preview-confirm");
  const exportScopeButtons = [...document.querySelectorAll("#export-scope-actions [data-scope]")];
  const importPreviewModal = $("import-preview-modal");
  const importPreviewProducts = $("import-preview-products");
  const importPreviewProductsDiff = $("import-preview-products-diff");
  const importPreviewArchive = $("import-preview-archive");
  const importPreviewArchiveDiff = $("import-preview-archive-diff");
  const importPreviewGoal = $("import-preview-goal");
  const importPreviewVersion = $("import-preview-version");
  const importPreviewDate = $("import-preview-date");
  const importPreviewCancel = $("import-preview-cancel");
  const importPreviewConfirm = $("import-preview-confirm");
  const importScopeButtons = [...document.querySelectorAll("#import-scope-actions [data-scope]")];
  const leaveSiteButton = $("leave-site");
  const undoLastAction = $("undo-last-action");
  const refreshSiteButton = $("refresh-site");
  const medicineOpenAdd = $("medicine-open-add");
  const medicineClearAll = $("medicine-clear-all");
  const medicineBaseList = $("medicine-base-list");
  const medicineBuyList = $("medicine-buy-list");
  const medicineOpenBuyAdd = $("medicine-open-buy-add");
  const medicineTodaySummary = $("medicine-today-summary");
  const medicineOpenToday = $("medicine-open-today");
  const medicineSelectModal = $("medicine-select-modal");
  const medicineSelectList = $("medicine-select-list");
  const medicineSelectCancel = $("medicine-select-cancel");
  const medicineSaveDay = $("medicine-save-day");
  const medicineHistory = $("medicine-history");
  const medicineAddModal = $("medicine-add-modal");
  const medicineFormName = $("medicine-form-name");
  const medicineFormDose = $("medicine-form-dose");
  const medicineFormFull = $("medicine-form-full");
  const medicineAddCancel = $("medicine-add-cancel");
  const medicineAddSave = $("medicine-add-save");
  const medicineBuyModal = $("medicine-buy-modal");
  const medicineBuyName = $("medicine-buy-name");
  const medicineBuyDose = $("medicine-buy-dose");
  const medicineBuyFull = $("medicine-buy-full");
  const medicineBuyCancel = $("medicine-buy-cancel");
  const medicineBuySave = $("medicine-buy-save");
  const consoleLog = $("console-log");
  const statsChart = $("stats-chart");
  const statsEmpty = $("stats-empty");
  const statsTooltip = $("stats-tooltip");
  const statsMonthSummary = $("stats-month-summary");
  let statsRenderedPoints = [];
  let statsChartGeometry = null;
  const statsFrom = $("stats-from");
  const statsTo = $("stats-to");
  const statsMetricButtons = document.querySelectorAll(".stats-metric");
  let statsMetric = "kcal";

  const archiveTextModal = $("archive-text-modal");
  const archiveTextInput = $("archive-text-input");
  const archiveTextCancel = $("archive-text-cancel");
  const archiveTextSave = $("archive-text-save");

  const statusStyle = document.createElement("style");
  statusStyle.textContent = `
    .button-status-success{background:#22c55e!important;color:#fff!important;box-shadow:0 0 0 1px rgba(34,197,94,.35),0 0 18px rgba(34,197,94,.35)!important}
    .button-status-error{background:#ef4444!important;color:#fff!important;box-shadow:0 0 0 1px rgba(239,68,68,.35),0 0 18px rgba(239,68,68,.35)!important}
    .button-status-info{background:#7289da!important;color:#fff!important;box-shadow:0 0 0 1px rgba(114,137,218,.35),0 0 18px rgba(114,137,218,.35)!important}
    .button-status-success::after{content:"✓";margin-left:7px;font-weight:800}
    .button-status-error::after{content:"✕";margin-left:7px;font-weight:800}
  `;
  document.head.appendChild(statusStyle);

  function clearButtonStatus(button) {
    button?.classList.remove("button-status-success","button-status-error","button-status-info");
  }
  function showButtonState(button,text,state,duration=1500) {
    if (!button) return;
    if (!button.dataset.originalText) button.dataset.originalText = button.textContent.trim();
    clearTimeout(button._statusTimeout);
    clearButtonStatus(button);
    button.textContent = text;
    if (state) button.classList.add(`button-status-${state}`);
    if (duration > 0) button._statusTimeout = setTimeout(() => {
      button.textContent = button.dataset.originalText || "";
      clearButtonStatus(button);
    }, duration);
  }
  function setButtonStatusPermanent(button,text,state) { showButtonState(button,text,state,0); }

  function formatConsoleDate(date = new Date()) {
    const d=String(date.getDate()).padStart(2,"0"),m=String(date.getMonth()+1).padStart(2,"0"),y=date.getFullYear();
    const h=String(date.getHours()).padStart(2,"0"),mi=String(date.getMinutes()).padStart(2,"0"),se=String(date.getSeconds()).padStart(2,"0");
    return `${d}.${m}.${y} ${h}:${mi}:${se}`;
  }
  function saveConsoleLocal(){ localStorage.setItem(CONSOLE_KEY,JSON.stringify(consoleItems)); }
  function logAction(message){
    consoleItems.push({id:createId("console"),time:new Date().toISOString(),message:String(message ?? "Невідома дія")});
    saveConsoleLocal(); renderConsole();
  }
  function renderConsole(){
    if(!consoleLog)return; consoleLog.innerHTML="";
    if(!consoleItems.length){consoleLog.innerHTML='<div class="console-entry">Журнал дій порожній.</div>';return;}
    [...consoleItems].reverse().forEach(item=>{
      const row=document.createElement("div");row.className="console-entry";
      const dt=item.time?new Date(item.time):new Date();row.textContent=`[${formatConsoleDate(dt)}] ${item.message}`;consoleLog.append(row);
    });
  }

  function undoStorageValue(key){const value=localStorage.getItem(key);return value===null?null:value;}
  function saveUndoSnapshot(description){
    const snapshot={
      description:String(description||"Остання дія"),
      products:JSON.parse(JSON.stringify(products)),
      calculatorItems:JSON.parse(JSON.stringify(calculatorItems)),
      archiveItems:JSON.parse(JSON.stringify(archiveItems)),
      dailyGoal:JSON.parse(JSON.stringify(dailyGoal)),
      calcDraft:calcInput?calcInput.value:undoStorageValue(CALCULATOR_DRAFT_KEY),
      sort:currentSort,
      meta:{
        databaseUpdated:undoStorageValue(DATABASE_UPDATED_KEY),
        exportVersion:undoStorageValue(EXPORT_VERSION_KEY),
        exportFingerprint:undoStorageValue(EXPORT_FINGERPRINT_KEY),
        lastExport:undoStorageValue(LAST_EXPORT_KEY),
        lastImport:undoStorageValue(LAST_IMPORT_KEY)
      }
    };
    localStorage.setItem(UNDO_KEY,JSON.stringify(snapshot));
  }
  function restoreStorageValue(key,value){if(value===null||value===undefined)localStorage.removeItem(key);else localStorage.setItem(key,String(value));}
  function applyUndoSnapshot(){
    let snapshot=null;
    try{snapshot=JSON.parse(localStorage.getItem(UNDO_KEY)||"null");}catch(_){snapshot=null;}
    if(!snapshot){showButtonState(undoLastAction,"Немає дії","error",1500);logAction("Undo не виконано: немає дії для скасування.");return;}
    products=Array.isArray(snapshot.products)?snapshot.products.map((p,i)=>normalizeProduct(p,i)):products;
    calculatorItems=Array.isArray(snapshot.calculatorItems)?snapshot.calculatorItems:calculatorItems;
    archiveItems=Array.isArray(snapshot.archiveItems)?snapshot.archiveItems:archiveItems;
    if(snapshot.dailyGoal&&typeof snapshot.dailyGoal==="object")dailyGoal={...dailyGoal,...snapshot.dailyGoal};
    currentSort=snapshot.sort||"manual";
    localStorage.setItem(PRODUCTS_KEY,JSON.stringify(products));
    localStorage.setItem(CALCULATOR_KEY,JSON.stringify(calculatorItems));
    localStorage.setItem(ARCHIVE_KEY,JSON.stringify(archiveItems));
    localStorage.setItem(DAILY_GOAL_KEY,JSON.stringify(dailyGoal));
    localStorage.setItem(SORT_KEY,currentSort);
    if(calcInput){calcInput.value=snapshot.calcDraft||"";if(snapshot.calcDraft)localStorage.setItem(CALCULATOR_DRAFT_KEY,snapshot.calcDraft);else localStorage.removeItem(CALCULATOR_DRAFT_KEY);}
    const meta=snapshot.meta||{};
    restoreStorageValue(DATABASE_UPDATED_KEY,meta.databaseUpdated);
    restoreStorageValue(EXPORT_VERSION_KEY,meta.exportVersion);
    restoreStorageValue(EXPORT_FINGERPRINT_KEY,meta.exportFingerprint);
    restoreStorageValue(LAST_EXPORT_KEY,meta.lastExport);
    restoreStorageValue(LAST_IMPORT_KEY,meta.lastImport);
    localStorage.removeItem(UNDO_KEY);
    for(const key of Object.keys(goalInputs))if(goalInputs[key])goalInputs[key].value=dailyGoal[key]||"";
    renderProducts(searchInput?.value||"");renderCalculatorLog();updateTotals();renderDailyGoal();renderArchive();renderStatistics();updateSiteDataCounts();
    showButtonState(undoLastAction,"Повернуто","success",1500);
    logAction(`Undo: скасовано дію «${snapshot.description||"Остання дія"}».`);
  }

  function createId(prefix="id") { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`; }
  function number(value) { const n=Number(value); return Number.isFinite(n)?n:0; }
  function round(value,decimals=1) { const f=10**decimals; return Math.round((number(value)+Number.EPSILON)*f)/f; }
  function formatNumber(value) {
    const n=number(value);
    const rounded=Math.round((n+Number.EPSILON)*1000)/1000;
    const text=rounded.toFixed(3);
    return text.endsWith("0")?text.slice(0,-1):text;
  }
  function getInitials(name) {
    const words=String(name||"").trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "?";
    return words.length===1?words[0].slice(0,2).toUpperCase():(words[0][0]+words[1][0]).toUpperCase();
  }
  function normalizeProduct(product,index=0) {
    return {
      id:String(product.id ?? createId("product")),
      name:String(product.name ?? "").trim(),
      kcal:number(product.kcal),
      kcal_no_data:Boolean(product.kcal_no_data ?? product.no_data?.kcal),
      protein:number(product.protein ?? product.proteins),
      protein_no_data:Boolean(product.protein_no_data ?? product.no_data?.protein),
      fat:number(product.fat),
      fat_no_data:Boolean(product.fat_no_data ?? product.no_data?.fat),
      carb:number(product.carb ?? product.carbs),
      carb_no_data:Boolean(product.carb_no_data ?? product.no_data?.carb),
      sugar:number(product.sugar ?? product.sugars),
      sugar_no_data:Boolean(product.sugar_no_data ?? product.no_data?.sugar),
      salt:number(product.salt),
      salt_no_data:Boolean(product.salt_no_data ?? product.no_data?.salt),
      fiber:number(product.fiber ?? product.fibre),
      fiber_no_data:Boolean(product.fiber_no_data ?? product.no_data?.fiber),
      unit:product.unit==="мл"?"мл":"г",
      full_name:String(product.full_name ?? product.description ?? "").trim(),
      full_name_no_data:Boolean(product.full_name_no_data ?? product.description_no_data ?? product.no_data?.full_name),
      created_at:String(product.created_at || new Date(2000,0,1,0,0,index).toISOString())
    };
  }
  function loadArray(key) {
    try { const p=JSON.parse(localStorage.getItem(key)||"[]"); return Array.isArray(p)?p:[]; } catch { return []; }
  }
  function saveProductsLocal(){
    localStorage.setItem(PRODUCTS_KEY,JSON.stringify(products));
    localStorage.setItem(DATABASE_UPDATED_KEY,new Date().toISOString());
    updateSiteDataCounts();
  }
  function saveCalculatorLocal(){ localStorage.setItem(CALCULATOR_KEY,JSON.stringify(calculatorItems)); }
  function saveArchiveLocal(){ localStorage.setItem(ARCHIVE_KEY,JSON.stringify(archiveItems)); }
  function saveMedicinesLocal(){ localStorage.setItem(MEDICINES_KEY,JSON.stringify(medicines)); }
  function saveMedicineArchiveLocal(){ localStorage.setItem(MEDICINE_ARCHIVE_KEY,JSON.stringify(medicineArchive)); }
  function saveMedicineBuyLocal(){ localStorage.setItem(MEDICINE_BUY_KEY,JSON.stringify(medicineBuy)); }
  function saveCalculatorDraft(){ if(calcInput)localStorage.setItem(CALCULATOR_DRAFT_KEY,calcInput.value); }
  function updateSiteDataCounts(){
    if(siteProductsCount)siteProductsCount.textContent=String(products.length);
    if(siteArchiveCount)siteArchiveCount.textContent=String(archiveItems.length);
    if(siteDatabaseUpdated){
      const raw=localStorage.getItem(DATABASE_UPDATED_KEY);
      if(!raw){siteDatabaseUpdated.textContent="Ще не оновлювалася";}
      else{const d=new Date(raw);siteDatabaseUpdated.textContent=`${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()} о ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;}
    }
    if(siteLastExport){
      const raw=localStorage.getItem(LAST_EXPORT_KEY);
      if(!raw)siteLastExport.textContent="Ще не виконувався";
      else{
        const then=new Date(raw),now=new Date();
        const startThen=new Date(then.getFullYear(),then.getMonth(),then.getDate());
        const startNow=new Date(now.getFullYear(),now.getMonth(),now.getDate());
        const days=Math.max(0,Math.round((startNow-startThen)/86400000));
        siteLastExport.textContent=days===0?"сьогодні":days===1?"1 день тому":`${days} днів тому`;
      }
    }
    if(siteLastImport){
      const raw=localStorage.getItem(LAST_IMPORT_KEY);
      if(!raw)siteLastImport.textContent="Ще не виконувався";
      else{
        const then=new Date(raw),now=new Date();
        const startThen=new Date(then.getFullYear(),then.getMonth(),then.getDate());
        const startNow=new Date(now.getFullYear(),now.getMonth(),now.getDate());
        const days=Math.max(0,Math.round((startNow-startThen)/86400000));
        siteLastImport.textContent=days===0?"сьогодні":days===1?"1 день тому":`${days} днів тому`;
      }
    }
    if(siteCurrentDate){const d=new Date();siteCurrentDate.textContent=`${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;}
  }
  function exportFingerprint(){
    return JSON.stringify({products:products.map((p,i)=>normalizeProduct(p,i)),archive:archiveItems});
  }
  function getExportVersion(){
    const fingerprint=exportFingerprint();
    const previous=localStorage.getItem(EXPORT_FINGERPRINT_KEY);
    let version=Math.max(0,parseInt(localStorage.getItem(EXPORT_VERSION_KEY)||"0",10)||0);
    if(previous!==fingerprint){version+=1;localStorage.setItem(EXPORT_VERSION_KEY,String(version));localStorage.setItem(EXPORT_FINGERPRINT_KEY,fingerprint);}
    if(version<1){version=1;localStorage.setItem(EXPORT_VERSION_KEY,"1");localStorage.setItem(EXPORT_FINGERPRINT_KEY,fingerprint);}
    return version;
  }
  function getSortedProducts() {
    const arr=[...products];
    if(currentSort==="oldest") arr.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
    if(currentSort==="newest") arr.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    return arr;
  }

  tabs.forEach(tab=>tab.addEventListener("click",()=>{
    const target=tab.dataset.tab;
    tabs.forEach(t=>t.classList.remove("active"));
    pages.forEach(p=>p.classList.remove("active"));
    tab.classList.add("active");
    $(target)?.classList.add("active");
    localStorage.setItem(ACTIVE_TAB_KEY,target);
    if(target==="archive"){renderArchive();requestAnimationFrame(()=>renderStatistics());}
    if(target==="calculator"){renderCalculatorLog();updateTotals();}
    if(target==="medicines")renderMedicines();
    if(target==="console")renderConsole();
  }));

  function renderProducts(filter="") {
    if(!grid)return;
    updateSiteDataCounts();
    const q=String(filter).trim().toLowerCase();
    grid.innerHTML="";
    const filtered=getSortedProducts().filter(p=>!q||p.name.toLowerCase().includes(q)||p.full_name.toLowerCase().includes(q));
    if(!filtered.length){
      const empty=document.createElement("div");
      empty.style.cssText="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-secondary)";
      empty.textContent="Продуктів не знайдено.";
      grid.appendChild(empty); return;
    }
    filtered.forEach(p=>grid.appendChild(createProductCard(p)));
    updateReorderState();
  }

  function iconCopy(){
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 21H6a2 2 0 0 1-2-2V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><rect x="8" y="3" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/></svg><span class="tooltip">Скопіювати</span>`;
  }
  function iconEdit(){
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="tooltip">Редагувати</span>`;
  }
  function createProductCard(product){
    const card=document.createElement("article");
    card.className="food-card"; card.dataset.id=product.id;
    const actions=document.createElement("div"); actions.className="card-actions";
    const copy=document.createElement("button"); copy.type="button"; copy.className="copy-btn"; copy.innerHTML=iconCopy();
    const edit=document.createElement("button"); edit.type="button"; edit.className="edit-btn"; edit.innerHTML=iconEdit();
    copy.addEventListener("click",e=>{e.stopPropagation();openProductModal(product);});
    edit.addEventListener("click",e=>{e.stopPropagation();openEditProductModal(product);});
    actions.append(copy,edit);

    const title=document.createElement("div"); title.className="food-title";
    const badge=document.createElement("div"); badge.className="badge"; badge.textContent=getInitials(product.name);
    const tc=document.createElement("div");
    const name=document.createElement("div"); name.className="name"; name.textContent=product.name;
    const meta=document.createElement("div"); meta.className="meta"; meta.textContent=`100 ${product.unit||"г"}`;
    tc.append(name,meta); title.append(badge,tc);

    const kbjv=document.createElement("div"); kbjv.className="kbjv";
    const row=(key,val,unit="г",noData=false)=>`<div class="row"><div class="key">${key}</div><div class="val${noData?" no-data-value":""}">${noData?"Немає даних":`${formatNumber(val)} ${unit}`}</div></div>`;
    kbjv.innerHTML =
      row("Калорії",product.kcal,"ккал",product.kcal_no_data) +
      `<div class="kbjv-divider"></div>` +
      row("Білки",product.protein,"г",product.protein_no_data) +
      row("Жири",product.fat,"г",product.fat_no_data) +
      row("Вуглеводи",product.carb,"г",product.carb_no_data) +
      `<div class="kbjv-divider"></div>` +
      row("Цукри",product.sugar,"г",product.sugar_no_data) +
      row("Сіль",product.salt,"г",product.salt_no_data) +
      `<div class="kbjv-divider"></div>` +
      row("Клітковина",product.fiber,"г",product.fiber_no_data) +
      `<div class="kbjv-divider"></div>`;

    const full=document.createElement("div"); full.className="full-name";
    full.textContent=product.full_name_no_data?"Немає даних":(product.full_name||"");
    if(product.full_name_no_data)full.classList.add("no-data-value");
    card.append(actions,title,kbjv,full);
    card.addEventListener("click",e=>{if(!reorderMode&&!e.target.closest(".card-actions"))openProductModal(product);});
    return card;
  }

  searchInput?.addEventListener("input",()=>{renderProducts(searchInput.value);clearSearch.style.display=searchInput.value?"block":"none";});
  clearSearch?.addEventListener("click",()=>{searchInput.value="";clearSearch.style.display="none";renderProducts();searchInput.focus();});

  function openProductModal(product){selectedProduct=product;productModalName.textContent=product.name;productWeight.value="100";productModal.classList.add("active");document.body.classList.add("edit-modal-open");}
  function closeProductModal(){selectedProduct=null;productModal.classList.remove("active");document.body.classList.remove("edit-modal-open");}
  productCancel?.addEventListener("click",closeProductModal);
  productModal?.addEventListener("click",e=>{if(e.target===productModal)closeProductModal();});
  productModal?.addEventListener("touchmove",e=>{if(e.target===productModal)e.preventDefault();},{passive:false});

  function calculateProduct(product,weight){
    const m=number(weight)/100;
    return {kcal:product.kcal*m,protein:product.protein*m,fat:product.fat*m,carb:product.carb*m,sugar:product.sugar*m,salt:product.salt*m,fiber:product.fiber*m};
  }
  function getProductSummary(product,weight){
    const v=calculateProduct(product,weight);
    const kcalText=product.kcal_no_data?"немає даних калорій":`${formatNumber(v.kcal)} ккал`;
    const proteinText=product.protein_no_data?"немає даних білків":`${formatNumber(v.protein)} білка`;
    const fatText=product.fat_no_data?"немає даних жирів":`${formatNumber(v.fat)} жирів`;
    const carbText=product.carb_no_data?"немає даних вуглеводів":`${formatNumber(v.carb)} вуглеводів`;
    const sugarText=product.sugar_no_data?"немає даних цукрів":`${formatNumber(v.sugar)} цукрів`;
    const saltText=product.salt_no_data?"немає даних солі":`${formatNumber(v.salt)} солі`;
    const fiberText=product.fiber_no_data?"немає даних клітковини":`${formatNumber(v.fiber)} клітковини`;
    return `${product.name}, для ${formatNumber(weight)} грам - ${kcalText} / ${proteinText} / ${fatText} / ${carbText} / ${sugarText} / ${saltText} / ${fiberText}`;
  }
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);return true;}catch{
      const t=document.createElement("textarea");t.value=text;t.style.position="fixed";t.style.left="-9999px";document.body.append(t);t.select();document.execCommand("copy");t.remove();return true;
    }
  }
  productCopy?.addEventListener("click",async()=>{
    if(!selectedProduct)return; const w=number(productWeight.value); if(w<=0)return productWeight.focus();
    if(await copyText(getProductSummary(selectedProduct,w))){showButtonState(productCopy,"Скопійовано","success",1200);logAction(`Скопійовано продукт «${selectedProduct.name}» (${formatNumber(w)} г).`);}
  });
  productCalculator?.addEventListener("click",()=>{
    if(!selectedProduct)return; const w=number(productWeight.value); if(w<=0)return productWeight.focus();
    const productName=selectedProduct.name;
    const text=getProductSummary(selectedProduct,w);
    saveUndoSnapshot(`Додавання продукту «${productName}» у поле калькулятора`);
    const current=calcInput.value.trim(); calcInput.value=current?`${current}\n${text}`:text; saveCalculatorDraft();
    closeProductModal(); showButtonState(productCalculator,"Додано","success",1500); logAction(`Продукт «${productName}» додано в калькулятор.`);
  });

  function setNoDataField(input,checkbox,active,emptyValue="0"){
    if(!input||!checkbox)return;
    checkbox.checked=!!active;
    input.disabled=!!active;
    if(active)input.value=emptyValue;
  }
  const noDataFieldPairs=[
    [newProductKcal,newProductKcalNoData,"0"],
    [newProductProtein,newProductProteinNoData,"0"],
    [newProductFat,newProductFatNoData,"0"],
    [newProductCarb,newProductCarbNoData,"0"],
    [newProductSugar,newProductSugarNoData,"0"],
    [newProductSalt,newProductSaltNoData,"0"],
    [newProductFiber,newProductFiberNoData,"0"],
    [newProductDescription,newProductDescriptionNoData,""],
    [editProductKcal,editProductKcalNoData,"0"],
    [editProductProtein,editProductProteinNoData,"0"],
    [editProductFat,editProductFatNoData,"0"],
    [editProductCarb,editProductCarbNoData,"0"],
    [editProductSugar,editProductSugarNoData,"0"],
    [editProductSalt,editProductSaltNoData,"0"],
    [editProductFiber,editProductFiberNoData,"0"],
    [editProductDescription,editProductDescriptionNoData,""]
  ];
  noDataFieldPairs.forEach(([input,checkbox,emptyValue])=>checkbox?.addEventListener("change",()=>setNoDataField(input,checkbox,checkbox.checked,emptyValue)));

  function clearAddForm(){
    [newProductName,newProductKcal,newProductProtein,newProductFat,newProductCarb,newProductSugar,newProductSalt,newProductFiber,newProductDescription].forEach(el=>el.value="");
    [
      [newProductKcal,newProductKcalNoData,"0"],
      [newProductProtein,newProductProteinNoData,"0"],
      [newProductFat,newProductFatNoData,"0"],
      [newProductCarb,newProductCarbNoData,"0"],
      [newProductSugar,newProductSugarNoData,"0"],
      [newProductSalt,newProductSaltNoData,"0"],
      [newProductFiber,newProductFiberNoData,"0"],
      [newProductDescription,newProductDescriptionNoData,""]
    ].forEach(([input,checkbox,emptyValue])=>setNoDataField(input,checkbox,false,emptyValue));
  }
  addProductButton?.addEventListener("click",()=>{clearAddForm();addProductModal.classList.add("active");document.body.classList.add("edit-modal-open");setTimeout(()=>newProductName.focus(),50);});
  addProductCancel?.addEventListener("click",()=>{showButtonState(addProductCancel,"Скасовано","error",500);setTimeout(()=>{addProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");},180);showButtonState(addProductButton,"Продукт не додано","error",1500);logAction("Додавання продукту скасовано.");});
  addProductModal?.addEventListener("click",e=>{if(e.target===addProductModal){addProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");}});
  addProductSave?.addEventListener("click",()=>{
    const name=newProductName.value.trim(); if(!name)return newProductName.focus();
    saveUndoSnapshot(`Додавання продукту «${name}»`);
    products.push(normalizeProduct({
      id:createId("product"),name,
      kcal:newProductKcalNoData?.checked?0:newProductKcal.value,kcal_no_data:!!newProductKcalNoData?.checked,
      protein:newProductProteinNoData?.checked?0:newProductProtein.value,protein_no_data:!!newProductProteinNoData?.checked,
      fat:newProductFatNoData?.checked?0:newProductFat.value,fat_no_data:!!newProductFatNoData?.checked,
      carb:newProductCarbNoData?.checked?0:newProductCarb.value,carb_no_data:!!newProductCarbNoData?.checked,
      sugar:newProductSugarNoData?.checked?0:newProductSugar.value,sugar_no_data:!!newProductSugarNoData?.checked,
      salt:newProductSaltNoData?.checked?0:newProductSalt.value,salt_no_data:!!newProductSaltNoData?.checked,
      fiber:newProductFiberNoData?.checked?0:newProductFiber.value,fiber_no_data:!!newProductFiberNoData?.checked,
      unit:"г",
      full_name:newProductDescriptionNoData?.checked?"":newProductDescription.value.trim(),
      full_name_no_data:!!newProductDescriptionNoData?.checked,
      created_at:new Date().toISOString()
    }));
    saveProductsLocal();renderProducts(searchInput?.value||"");showButtonState(addProductSave,"Збережено","success",500);
    setTimeout(()=>{addProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");},180);
    showButtonState(addProductButton,"Продукт додано","success",1500); logAction(`Додано продукт «${name}».`);
  });

  function openEditProductModal(product){
    editingProduct=product;
    editProductName.value=product.name;
    editProductKcal.value=product.kcal;setNoDataField(editProductKcal,editProductKcalNoData,product.kcal_no_data);
    editProductProtein.value=product.protein;setNoDataField(editProductProtein,editProductProteinNoData,product.protein_no_data);
    editProductFat.value=product.fat;setNoDataField(editProductFat,editProductFatNoData,product.fat_no_data);
    editProductCarb.value=product.carb;setNoDataField(editProductCarb,editProductCarbNoData,product.carb_no_data);
    editProductSugar.value=product.sugar;setNoDataField(editProductSugar,editProductSugarNoData,product.sugar_no_data);
    editProductSalt.value=product.salt;setNoDataField(editProductSalt,editProductSaltNoData,product.salt_no_data);
    editProductFiber.value=product.fiber;setNoDataField(editProductFiber,editProductFiberNoData,product.fiber_no_data);
    editProductDescription.value=product.full_name||"";setNoDataField(editProductDescription,editProductDescriptionNoData,product.full_name_no_data,"");
    editProductModal.classList.add("active");document.body.classList.add("edit-modal-open");setTimeout(()=>editProductName.focus(),50);
  }
  function closeEditProductModal(){editingProduct=null;editProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");}
  editProductCancel?.addEventListener("click",()=>{const n=editingProduct?.name||"продукту";closeEditProductModal();showButtonState(editProductSave,"Не збережено","error",1500);logAction(`Редагування «${n}» скасовано.`);});
  editProductModal?.addEventListener("click",e=>{if(e.target===editProductModal)closeEditProductModal();});
  editProductModal?.addEventListener("touchmove",e=>{if(e.target===editProductModal)e.preventDefault();},{passive:false});
  editProductSave?.addEventListener("click",()=>{
    if(!editingProduct)return;
    const name=editProductName.value.trim(); if(!name)return editProductName.focus();
    saveUndoSnapshot(`Редагування продукту «${editingProduct.name}»`);
    Object.assign(editingProduct,{
      name,
      kcal:editProductKcalNoData?.checked?0:number(editProductKcal.value),kcal_no_data:!!editProductKcalNoData?.checked,
      protein:editProductProteinNoData?.checked?0:number(editProductProtein.value),protein_no_data:!!editProductProteinNoData?.checked,
      fat:editProductFatNoData?.checked?0:number(editProductFat.value),fat_no_data:!!editProductFatNoData?.checked,
      carb:editProductCarbNoData?.checked?0:number(editProductCarb.value),carb_no_data:!!editProductCarbNoData?.checked,
      sugar:editProductSugarNoData?.checked?0:number(editProductSugar.value),sugar_no_data:!!editProductSugarNoData?.checked,
      salt:editProductSaltNoData?.checked?0:number(editProductSalt.value),salt_no_data:!!editProductSaltNoData?.checked,
      fiber:editProductFiberNoData?.checked?0:number(editProductFiber.value),fiber_no_data:!!editProductFiberNoData?.checked,
      full_name:editProductDescriptionNoData?.checked?"":editProductDescription.value.trim(),
      full_name_no_data:!!editProductDescriptionNoData?.checked
    });
    saveProductsLocal();renderProducts(searchInput?.value||"");closeEditProductModal();
    showButtonState(editProductSave,"Збережено","success",1500); logAction(`Зміни продукту «${name}» збережено.`);
  });

  function openSortModal(target="blocks"){sortTarget=target;sortProductsModal.classList.add("active");document.body.classList.add("edit-modal-open");}
  sortProductsButton?.addEventListener("click",()=>openSortModal("blocks"));
  deleteSortProducts?.addEventListener("click",()=>openSortModal("delete"));
  sortProductsCancel?.addEventListener("click",()=>{showButtonState(sortProductsCancel,"Скасовано","error",500);setTimeout(()=>{sortProductsModal.classList.remove("active");if(!deleteProductModal?.classList.contains("active"))document.body.classList.remove("edit-modal-open");},180);const b=sortTarget==="delete"?deleteSortProducts:sortProductsButton;showButtonState(b,"Не відсортовано","error",1500);logAction("Сортування продуктів скасовано.");});
  sortProductsModal?.addEventListener("click",e=>{if(e.target===sortProductsModal){sortProductsModal.classList.remove("active");if(!deleteProductModal?.classList.contains("active"))document.body.classList.remove("edit-modal-open");}});
  function applySort(mode){
    saveUndoSnapshot("Сортування продуктів");
    currentSort=mode;localStorage.setItem(SORT_KEY,mode);
    const selectedSortButton=mode==="oldest"?sortOldest:sortNewest;showButtonState(selectedSortButton,"Відсортовано","success",500);
    setTimeout(()=>{sortProductsModal.classList.remove("active");if(!deleteProductModal?.classList.contains("active"))document.body.classList.remove("edit-modal-open");},180);
    renderProducts(searchInput?.value||""); if(deleteProductModal.classList.contains("active"))renderDeleteProductList();
    showButtonState(sortTarget==="delete"?deleteSortProducts:sortProductsButton,mode==="oldest"?"Старіші → новіші":"Новіші → старіші","success",1500); logAction(`Продукти відсортовано: ${mode==="oldest"?"від старіших до новіших":"від новіших до старіших"}.`);
  }
  sortOldest?.addEventListener("click",()=>applySort("oldest"));
  sortNewest?.addEventListener("click",()=>applySort("newest"));

  deleteProductButton?.addEventListener("click",()=>{renderDeleteProductList();deleteProductModal.classList.add("active");document.body.classList.add("edit-modal-open");});
  [deleteProductCancelTop,deleteProductCancelBottom].forEach(b=>b?.addEventListener("click",()=>{showButtonState(b,"Скасовано","error",500);setTimeout(()=>{deleteProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");},180);showButtonState(deleteProductButton,"Продукт не видалено","error",1500);logAction("Видалення продукту скасовано.");}));
  deleteProductModal?.addEventListener("click",e=>{if(e.target===deleteProductModal){deleteProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");}});
  function renderDeleteProductList(){
    deleteProductList.innerHTML="";
    const list=getSortedProducts();
    if(!list.length){deleteProductList.innerHTML='<div class="delete-product-empty">База продуктів порожня.</div>';return;}
    list.forEach(product=>{
      const item=document.createElement("div");item.className="delete-product-item";
      const name=document.createElement("div");name.className="delete-product-item-name";name.textContent=product.name;
      const button=document.createElement("button");button.className="delete-product-item-button";button.textContent="Видалити";
      button.addEventListener("click",()=>{
        if(!confirm(`Видалити продукт "${product.name}"?`))return;
        saveUndoSnapshot(`Видалення продукту «${product.name}»`);
        products=products.filter(p=>p.id!==product.id);saveProductsLocal();renderProducts(searchInput?.value||"");renderDeleteProductList();
        showButtonState(deleteProductButton,"Продукт видалено","success",1500); logAction(`Видалено продукт «${product.name}».`);
      });
      item.append(name,button);deleteProductList.append(item);
    });
  }

  reorderProductsButton?.addEventListener("click",()=>{
    if(!reorderMode){reorderMode=true;reorderChanged=false;currentSort="manual";localStorage.setItem(SORT_KEY,"manual");setButtonStatusPermanent(reorderProductsButton,"Завершити зміну розташування?","info");updateReorderState();return;}
    reorderMode=false;updateReorderState();showButtonState(reorderProductsButton,reorderChanged?"Розташування змінено":"Розташування не змінено",reorderChanged?"success":"error",1800);logAction(reorderChanged?"Розташування продуктів змінено.":"Зміну розташування продуктів завершено без змін.");
  });
  function updateReorderState(){
    if(!grid)return;grid.classList.toggle("reorder-mode",reorderMode);
    grid.querySelectorAll(".food-card").forEach(card=>{card.draggable=reorderMode;if(reorderMode)attachDragEvents(card);});
  }
  function attachDragEvents(card){
    card.ondragstart=e=>{draggedCard=card;card.classList.add("dragging");e.dataTransfer.setData("text/plain",card.dataset.id);};
    card.ondragend=()=>{card.classList.remove("dragging");draggedCard=null;};
    card.ondragover=e=>{e.preventDefault();if(draggedCard&&draggedCard!==card)card.classList.add("drag-over");};
    card.ondragleave=()=>card.classList.remove("drag-over");
    card.ondrop=e=>{
      e.preventDefault();card.classList.remove("drag-over");if(!draggedCard||draggedCard===card)return;
      const from=products.findIndex(p=>p.id===draggedCard.dataset.id),to=products.findIndex(p=>p.id===card.dataset.id);
      if(from<0||to<0)return;if(!reorderChanged)saveUndoSnapshot("Зміна розташування продуктів");const [moved]=products.splice(from,1);products.splice(to,0,moved);reorderChanged=true;saveProductsLocal();renderProducts(searchInput?.value||"");
    };
  }

  function normalizeDailyGoal(value){
    const source=value&&typeof value==="object"?value:{};
    return {
      enabled:!!source.enabled,
      kcal:Math.max(0,number(source.kcal)),
      protein:Math.max(0,number(source.protein)),
      fat:Math.max(0,number(source.fat)),
      carb:Math.max(0,number(source.carb)),
      sugar:Math.max(0,number(source.sugar)),
      salt:Math.max(0,number(source.salt)),
      fiber:Math.max(0,number(source.fiber))
    };
  }
  function hasDailyGoalData(value){
    const goal=normalizeDailyGoal(value);
    return ["kcal","protein","fat","carb","sugar","salt","fiber"].some(key=>goal[key]>0);
  }

  function peekExportVersion(){
    const fingerprint=exportFingerprint();
    const previous=localStorage.getItem(EXPORT_FINGERPRINT_KEY);
    let version=Math.max(0,parseInt(localStorage.getItem(EXPORT_VERSION_KEY)||"0",10)||0);
    if(previous!==fingerprint)version+=1;
    return Math.max(1,version);
  }
  function exportScopeLabel(scope){
    if(scope==="blocks")return "тільки КБЖВ-блоки";
    if(scope==="archive")return "тільки КБЖВ-історію";
    if(scope==="goal")return "тільки денну ціль";
    return hasDailyGoalData(dailyGoal)?"КБЖВ-блоки, історію та денну ціль":"КБЖВ-блоки та історію";
  }
  function updateExportScopeUI(){
    const hasGoal=hasDailyGoalData(dailyGoal);
    exportScopeButtons.forEach(button=>{
      const disabled=button.dataset.scope==="goal"&&!hasGoal;
      button.disabled=disabled;
      button.classList.toggle("transfer-scope-selected",!disabled&&button.dataset.scope===exportScope);
    });

    if(exportPreviewProducts){
      exportPreviewProducts.textContent=(exportScope==="archive"||exportScope==="goal")?"Не експортується":String(products.length);
    }
    if(exportPreviewArchive){
      exportPreviewArchive.textContent=(exportScope==="blocks"||exportScope==="goal")?"Не експортується":String(archiveItems.length);
    }
    if(exportPreviewGoal){
      exportPreviewGoal.textContent=!hasGoal?"Не задана":(exportScope==="blocks"||exportScope==="archive")?"Не експортується":"Задана";
    }
  }
  function closeExportPreview(){
    exportPreviewModal?.classList.remove("active");
    document.body.classList.remove("edit-modal-open");
    pendingExport=null;
  }
  function performPendingExport(){
    if(!pendingExport)return;
    const hasGoal=hasDailyGoalData(dailyGoal);
    if(exportScope==="goal"&&!hasGoal)return;

    const version=getExportVersion();
    const exportedAt=pendingExport.exportedAt;
    const data={version,exported_at:exportedAt,export_scope:exportScope};

    if(exportScope==="all"||exportScope==="blocks")data.products=products.map((p,i)=>normalizeProduct(p,i));
    if(exportScope==="all"||exportScope==="archive")data.archive=archiveItems;
    if((exportScope==="all"&&hasGoal)||exportScope==="goal")data.daily_goal=normalizeDailyGoal(dailyGoal);

    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    const suffix=exportScope==="blocks"?"-blocks":exportScope==="archive"?"-archive":exportScope==="goal"?"-daily-goal":"";
    a.href=url;a.download=`version-${version}${suffix}.json`;
    document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);

    localStorage.setItem(LAST_EXPORT_KEY,new Date().toISOString());
    updateSiteDataCounts();
    closeExportPreview();
    showButtonState(exportButton,"Експортовано","success",1800);
    logAction(`Експортовано version-${version}: ${exportScopeLabel(exportScope)}.`);
  }
  exportButton?.addEventListener("click",()=>{
    const version=peekExportVersion(),exportedAt=new Date().toISOString();
    exportScope="all";
    pendingExport={version,exportedAt};
    if(exportPreviewVersion)exportPreviewVersion.textContent=String(version);
    if(exportPreviewDate)exportPreviewDate.textContent=formatImportDate(exportedAt);
    updateExportScopeUI();
    exportPreviewModal?.classList.add("active");
    document.body.classList.add("edit-modal-open");
    logAction(`Перевірка експорту відкрита: ${products.length} продуктів, ${archiveItems.length} записів архіву${hasDailyGoalData(dailyGoal)?", денна ціль задана":", денна ціль не задана"}, version-${version}. Очікується підтвердження.`);
  });
  exportScopeButtons.forEach(button=>button.addEventListener("click",()=>{
    if(button.disabled)return;
    exportScope=button.dataset.scope||"all";
    updateExportScopeUI();
  }));
  exportPreviewCancel?.addEventListener("click",()=>{
    showButtonState(exportPreviewCancel,"Скасовано","error",550);
    showButtonState(exportButton,"Не експортовано","error",1800);
    logAction("Експорт скасовано після перевірки.");
    setTimeout(closeExportPreview,200);
  });
  exportPreviewConfirm?.addEventListener("click",()=>{
    showButtonState(exportPreviewConfirm,"Експортовано","success",700);
    setTimeout(performPendingExport,250);
  });
  exportPreviewModal?.addEventListener("click",e=>{if(e.target===exportPreviewModal)exportPreviewCancel?.click();});

  let importDialogOpened=false;
  importButton?.addEventListener("click",()=>{importDialogOpened=true;importFile?.click();});
  window.addEventListener("focus",()=>{
    if(!importDialogOpened)return;
    setTimeout(()=>{
      if(importFile && (!importFile.files || importFile.files.length===0)){showButtonState(importButton,"Не імпортовано","error",1500);logAction("Імпорт бази скасовано.");}
      importDialogOpened=false;
    },200);
  });
  function formatImportDate(value){
    if(!value)return "Не вказано";const d=new Date(value);if(Number.isNaN(d.getTime()))return String(value);
    return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }
  function stableComparable(value){
    if(Array.isArray(value))return value.map(stableComparable);
    if(value&&typeof value==="object"){const out={};Object.keys(value).sort().forEach(k=>{if(!["created_at","updated_at"].includes(k))out[k]=stableComparable(value[k]);});return out;}
    return value;
  }
  function compareImportCollections(current,incoming,keyFn,normalizeFn=v=>v){
    const currentMap=new Map(current.map((item,i)=>[keyFn(item,i),normalizeFn(item,i)]));
    const incomingMap=new Map(incoming.map((item,i)=>[keyFn(item,i),normalizeFn(item,i)]));
    let added=0,changed=0,removed=0;
    incomingMap.forEach((value,key)=>{if(!currentMap.has(key))added++;else if(JSON.stringify(stableComparable(currentMap.get(key)))!==JSON.stringify(stableComparable(value)))changed++;});
    currentMap.forEach((_,key)=>{if(!incomingMap.has(key))removed++;});
    return {added,changed,removed};
  }
  function formatImportDiff(diff){return `+${diff.added} додано / ~${diff.changed} змінено / −${diff.removed} видалено`;}
  function productImportKey(item,index){const id=String(item?.id||"").trim();if(id)return `id:${id}`;return `name:${String(item?.name||"").trim().toLowerCase()||index}`;}
  function archiveImportKey(item,index){const id=String(item?.id||"").trim();if(id)return `id:${id}`;return `fallback:${String(item?.date||"")}|${String(item?.text||"")}|${index}`;}
  function updateImportScopeUI(){
    if(!pendingImport)return;
    const {hasProducts,hasArchive,hasGoal,normalized,importedArchive,productDiff,archiveDiff}=pendingImport;
    const canAll=hasProducts&&hasArchive;

    importScopeButtons.forEach(button=>{
      const scope=button.dataset.scope;
      const disabled=(scope==="all"&&!canAll)||(scope==="blocks"&&!hasProducts)||(scope==="archive"&&!hasArchive)||(scope==="goal"&&!hasGoal);
      button.disabled=disabled;
      button.classList.toggle("transfer-scope-selected",!disabled&&scope===importScope);
    });

    if(importPreviewProducts)importPreviewProducts.textContent=hasProducts?String(normalized.length):"Не містить блоків";
    if(importPreviewArchive)importPreviewArchive.textContent=hasArchive?String(importedArchive.length):"Не містить архіву";
    if(importPreviewGoal)importPreviewGoal.textContent=hasGoal?"Задана":"Не містить денної цілі";

    if(importPreviewProductsDiff){
      importPreviewProductsDiff.textContent=!hasProducts?"Недоступно":(importScope==="archive"||importScope==="goal")?"Не імпортується":formatImportDiff(productDiff);
    }
    if(importPreviewArchiveDiff){
      importPreviewArchiveDiff.textContent=!hasArchive?"Недоступно":(importScope==="blocks"||importScope==="goal")?"Не імпортується":formatImportDiff(archiveDiff);
    }
  }
  function closeImportPreview(){
    importPreviewModal?.classList.remove("active");
    document.body.classList.remove("edit-modal-open");
    pendingImport=null;
  }
  function applyPendingImport(){
    if(!pendingImport)return;
    const {parsed,normalized,hasProducts,hasArchive,hasGoal,importedArchive,importedGoal}=pendingImport;
    const importProducts=importScope==="all"||importScope==="blocks";
    const importArchive=importScope==="all"||importScope==="archive";
    const importGoal=(importScope==="goal")||(importScope==="all"&&hasGoal);

    if((importProducts&&!hasProducts)||(importArchive&&!hasArchive)||(importGoal&&!hasGoal))return;

    const description=importScope==="blocks"?"Імпорт КБЖВ-блоків":
      importScope==="archive"?"Імпорт КБЖВ-архіву":
      importScope==="goal"?"Імпорт денної цілі КБЖВ":
      "Імпорт бази, архіву та доступних додаткових даних";
    saveUndoSnapshot(description);

    if(importProducts){
      products=normalized;
      saveProductsLocal();
    }
    if(importArchive){
      archiveItems=importedArchive;
      saveArchiveLocal();
    }
    if(importGoal){
      dailyGoal=normalizeDailyGoal(importedGoal);
      localStorage.setItem(DAILY_GOAL_KEY,JSON.stringify(dailyGoal));
      dailyGoalSettingsOpen=false;
      for(const key of Object.keys(goalInputs))if(goalInputs[key])goalInputs[key].value=dailyGoal[key]||"";
      renderDailyGoal();
    }

    // Preserve the historical version only when the complete database was imported.
    if(importScope==="all"&&hasProducts&&hasArchive&&!Array.isArray(parsed)&&Number.isFinite(Number(parsed.version))){
      localStorage.setItem(EXPORT_VERSION_KEY,String(Math.max(1,Number(parsed.version))));
      localStorage.setItem(EXPORT_FINGERPRINT_KEY,exportFingerprint());
    }

    renderProducts(searchInput?.value||"");
    renderArchive();
    renderStatistics();
    updateSiteDataCounts();
    localStorage.setItem(LAST_IMPORT_KEY,new Date().toISOString());
    updateSiteDataCounts();

    const importedParts=[];
    if(importProducts)importedParts.push(`${products.length} КБЖВ-блоків`);
    if(importArchive)importedParts.push(`${archiveItems.length} записів КБЖВ-архіву`);
    if(importGoal)importedParts.push("денну ціль");
    closeImportPreview();
    showButtonState(importButton,"Імпортовано","success",1500);
    logAction(`Імпортовано: ${importedParts.join(", ")}.`);
    if(importFile)importFile.value="";
    importDialogOpened=false;
  }
  importPreviewCancel?.addEventListener("click",()=>{
    closeImportPreview();
    if(importFile)importFile.value="";
    importDialogOpened=false;
    showButtonState(importButton,"Не імпортовано","error",1500);
    showButtonState(importPreviewCancel,"Скасовано","error",1000);
    logAction("Імпорт скасовано після перевірки файла.");
  });
  importScopeButtons.forEach(button=>button.addEventListener("click",()=>{
    if(button.disabled)return;
    importScope=button.dataset.scope||"all";
    updateImportScopeUI();
  }));
  importPreviewConfirm?.addEventListener("click",()=>{
    showButtonState(importPreviewConfirm,"Імпортовано","success",700);
    setTimeout(applyPendingImport,250);
  });
  importPreviewModal?.addEventListener("click",e=>{if(e.target===importPreviewModal)importPreviewCancel?.click();});
  importFile?.addEventListener("change",async()=>{
    const file=importFile.files?.[0];if(!file)return;
    try{
      const parsed=JSON.parse(await file.text());

      const isOldArray=Array.isArray(parsed);
      const hasProducts=isOldArray||(!isOldArray&&Array.isArray(parsed.products));
      const hasArchive=!isOldArray&&Array.isArray(parsed.archive);
      const hasGoal=!isOldArray&&parsed.daily_goal&&typeof parsed.daily_goal==="object";

      if(!hasProducts&&!hasArchive&&!hasGoal)throw new Error("Невірний формат");

      const rawProducts=hasProducts?(isOldArray?parsed:parsed.products):[];
      const normalized=hasProducts?rawProducts.map((p,i)=>normalizeProduct(p,i)).filter(p=>p.name):[];
      const importedArchive=hasArchive?parsed.archive:[];
      const importedGoal=hasGoal?normalizeDailyGoal(parsed.daily_goal):null;

      const productDiff=hasProducts?compareImportCollections(products,rawProducts,productImportKey,(item,i)=>normalizeProduct(item,i)):null;
      const archiveDiff=hasArchive?compareImportCollections(archiveItems,importedArchive,archiveImportKey,item=>item):null;

      pendingImport={parsed,normalized,hasProducts,hasArchive,hasGoal,importedArchive,importedGoal,productDiff,archiveDiff};

      importScope=hasProducts&&hasArchive?"all":hasProducts?"blocks":hasArchive?"archive":"goal";

      if(importPreviewVersion)importPreviewVersion.textContent=!isOldArray&&parsed.version!=null?String(parsed.version):"Не вказано";
      if(importPreviewDate)importPreviewDate.textContent=!isOldArray?formatImportDate(parsed.exported_at):"Не вказано";
      updateImportScopeUI();

      importPreviewModal?.classList.add("active");
      document.body.classList.add("edit-modal-open");

      const fileContents=[
        hasProducts?`${normalized.length} блоків`:null,
        hasArchive?`${importedArchive.length} записів архіву`:null,
        hasGoal?"денна ціль":null
      ].filter(Boolean).join(", ");
      logAction(`Файл імпорту перевірено: ${fileContents}. Очікується вибір типу імпорту та підтвердження.`);
    }catch(e){
      console.error(e);
      pendingImport=null;
      showButtonState(importButton,"Не імпортовано","error",1500);
      logAction("Помилка перевірки файла імпорту.");
      alert("Не вдалося імпортувати базу.\n\nПеревірте JSON-файл.");
      if(importFile)importFile.value="";
      importDialogOpened=false;
    }
  });

  function loadDailyGoal(){
    try{const raw=JSON.parse(localStorage.getItem(DAILY_GOAL_KEY)||"null");if(raw&&typeof raw==="object")dailyGoal={...dailyGoal,...raw};}catch(_){}
    
    for(const key of Object.keys(goalInputs))if(goalInputs[key])goalInputs[key].value=dailyGoal[key]||"";
    renderDailyGoal();
  }
  function renderDailyGoal(){
    if(dailyGoalContent)dailyGoalContent.classList.toggle("goal-disabled",!dailyGoal.enabled);
    if(dailyGoalToggle){
      dailyGoalToggle.textContent=dailyGoal.enabled?"Вимкнути":"Увімкнути";
      dailyGoalToggle.classList.toggle("is-enabled",!!dailyGoal.enabled);
    }
    if(dailyGoalSettings)dailyGoalSettings.classList.toggle("is-collapsed",!dailyGoalSettingsOpen);
    if(dailyGoalDetailsToggle)dailyGoalDetailsToggle.textContent=dailyGoalSettingsOpen?"Сховати налаштування":"Показати налаштування";
    updateDailyGoalRemaining();
  }
  function getDailyGoalActual(){return {kcal:number(kcalElement?.textContent),protein:number(proteinElement?.textContent),fat:number(fatElement?.textContent),carb:number(carbElement?.textContent),sugar:number(sugarElement?.textContent),salt:number(saltElement?.textContent),fiber:number(fiberElement?.textContent)};}
  function updateDailyGoalRemaining(){
    if(!dailyGoal.enabled)return;
    const actual=getDailyGoalActual();
    for(const key of Object.keys(remainElements)){
      const el=remainElements[key];if(!el)continue;
      const target=number(dailyGoal[key]);
      const remaining=target-actual[key];
      el.textContent=formatNumber(remaining);
      el.classList.toggle("goal-exceeded",remaining<0);
      const fill=progressElements[key],label=progressLabels[key];
      if(fill){
        const ratio=target>0?actual[key]/target:0;
        fill.style.width=`${Math.max(0,Math.min(100,ratio*80))}%`;
        fill.classList.toggle("goal-progress-over",target>0&&actual[key]>target);
      }
      if(label)label.textContent=`${formatNumber(actual[key])} / ${formatNumber(target)}${key==="kcal"?"":" г"}`;
    }
  }
  dailyGoalToggle?.addEventListener("click",()=>{
    saveUndoSnapshot(dailyGoal.enabled?"Вимкнення денної цілі КБЖВ":"Увімкнення денної цілі КБЖВ");
    dailyGoal.enabled=!dailyGoal.enabled;
    const hasSavedTargets=Object.keys(goalInputs).some(key=>number(dailyGoal[key])>0);
    if(dailyGoal.enabled&&!hasSavedTargets)dailyGoalSettingsOpen=true;
    if(!dailyGoal.enabled)dailyGoalSettingsOpen=false;
    localStorage.setItem(DAILY_GOAL_KEY,JSON.stringify(dailyGoal));
    renderDailyGoal();
    showButtonState(dailyGoalToggle,dailyGoal.enabled?"Увімкнено":"Вимкнено",dailyGoal.enabled?"success":"error",1200);
    logAction(dailyGoal.enabled?"Денні цілі КБЖВ увімкнено.":"Денні цілі КБЖВ вимкнено.");
    setTimeout(()=>{if(dailyGoalToggle)dailyGoalToggle.textContent=dailyGoal.enabled?"Вимкнути":"Увімкнути";},1250);
  });
  dailyGoalSave?.addEventListener("click",()=>{saveUndoSnapshot("Зміна денної цілі КБЖВ");for(const key of Object.keys(goalInputs))dailyGoal[key]=Math.max(0,number(goalInputs[key]?.value));localStorage.setItem(DAILY_GOAL_KEY,JSON.stringify(dailyGoal));dailyGoalSettingsOpen=false;renderDailyGoal();showButtonState(dailyGoalSave,"Цілі збережено","success",1400);logAction("Денні цілі КБЖВ збережено.");});
  dailyGoalDetailsToggle?.addEventListener("click",()=>{dailyGoalSettingsOpen=!dailyGoalSettingsOpen;renderDailyGoal();showButtonState(dailyGoalDetailsToggle,dailyGoalSettingsOpen?"Відкрито":"Закрито","success",900);setTimeout(()=>{if(dailyGoalDetailsToggle)dailyGoalDetailsToggle.textContent=dailyGoalSettingsOpen?"Сховати налаштування":"Показати налаштування";},950);});
  dailyGoalCopyRemaining?.addEventListener("click",async()=>{
    if(!dailyGoal.enabled){showButtonState(dailyGoalCopyRemaining,"Ціль вимкнена","error",1400);return;}
    const actual=getDailyGoalActual();
    const r={};for(const key of Object.keys(actual))r[key]=number(dailyGoal[key])-actual[key];
    const text=`Залишилось до денної цілі: ${formatNumber(r.kcal)} калорій / ${formatNumber(r.protein)} білка / ${formatNumber(r.fat)} жирів / ${formatNumber(r.carb)} вуглеводів / ${formatNumber(r.sugar)} цукрів / ${formatNumber(r.salt)} солі / ${formatNumber(r.fiber)} клітковини`;
    if(await copyText(text)){showButtonState(dailyGoalCopyRemaining,"Скопійовано","success",1400);logAction("Залишок до денної цілі скопійовано.");}
  });

  function calculatorNumber(value){
    if(typeof value==="number")return Number.isFinite(value)?value:0;
    const normalized=String(value??"").trim().replace(/\s+/g,"").replace(",",".");
    const n=Number(normalized);
    return Number.isFinite(n)?n:0;
  }

  function extractCalculatorNutrition(text){
    const source=String(text||"").replace(/\u00A0/g," ").trim();
    if(!source)return null;

    const get=(patterns)=>{
      for(const pattern of patterns){
        const match=source.match(pattern);
        if(match)return calculatorNumber(match[1]);
      }
      return null;
    };

    // Each nutrient is extracted independently by its label.
    // One unusual word/spacing elsewhere in the line can no longer zero out fats or another macro.
    const kcal=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:ккал|калор(?:ій|ії|ія|ійність)?)/i
    ]);
    const protein=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:г(?:рам(?:ів|и|а)?)?\s*)?(?:білка|білку|білків|білок)/i
    ]);
    const fat=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:г(?:рам(?:ів|и|а)?)?\s*)?(?:жирів|жиру|жири|жир)/i
    ]);
    const carb=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:г(?:рам(?:ів|и|а)?)?\s*)?(?:вуглеводів|вуглеводи|вуглеводу)/i
    ]);
    const sugar=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:г(?:рам(?:ів|и|а)?)?\s*)?(?:цукрів|цукру|цукри|цукор)/i
    ]);
    const salt=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:г(?:рам(?:ів|и|а)?)?\s*)?(?:солі|сіль)/i
    ]);
    const fiber=get([
      /([+-]?[\d]+(?:[.,]\d+)?)\s*(?:г(?:рам(?:ів|и|а)?)?\s*)?(?:клітковини|клітковина)/i
    ]);

    const recognized=[kcal,protein,fat,carb,sugar,salt,fiber].some(v=>v!==null);
    if(!recognized)return null;

    return {
      kcal:kcal??0,
      protein:protein??0,
      fat:fat??0,
      carb:carb??0,
      sugar:sugar??0,
      salt:salt??0,
      fiber:fiber??0
    };
  }

  function parseCalculatorLine(line){
    const clean=String(line).trim().replace(/\s+/g," ");if(!clean)return null;

    const nutrition=extractCalculatorNutrition(clean);
    if(nutrition){
      const nameMatch=clean.match(/^(.+?),\s*для\s+/i);
      const weightMatch=clean.match(/,\s*для\s*([+-]?[\d]+(?:[.,]\d+)?)\s*(?:грам(?:ів|и|а)?|гр|г|мл)/i);
      return {
        id:createId("calc"),
        name:nameMatch?nameMatch[1].trim():clean,
        weight:weightMatch?calculatorNumber(weightMatch[1]):0,
        ...nutrition,
        text:clean,
        created_at:new Date().toISOString()
      };
    }

    // Preserve the existing free-text behavior.
    const km=clean.match(/^[+]?\s*([+-]?[\d]+(?:[.,]\d+)?)\s*(?:ккал|калор(?:і|и|ій|ія|ійність)?)\s*$/i);
    if(km)return{id:createId("calc"),name:clean,weight:0,kcal:calculatorNumber(km[1]),protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0,text:clean,created_at:new Date().toISOString()};

    return{id:createId("calc"),name:clean,weight:0,kcal:0,protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0,text:clean,created_at:new Date().toISOString()};
  }

  function normalizeCalculatorItem(item){
    if(!item||typeof item!=="object")return item;
    const text=String(item.text||item.name||"").trim();
    const fromText=extractCalculatorNutrition(text);

    // For any line that contains labeled nutrition values, the visible text is the source of truth.
    // This also repairs old calculator rows that were saved with a wrong/zero fat value.
    if(fromText){
      return {
        ...item,
        ...fromText,
        text,
        id:item.id||createId("calc"),
        created_at:item.created_at||new Date().toISOString()
      };
    }

    return {
      ...item,
      kcal:calculatorNumber(item.kcal),
      protein:calculatorNumber(item.protein),
      fat:calculatorNumber(item.fat ?? item.fats),
      carb:calculatorNumber(item.carb ?? item.carbs),
      sugar:calculatorNumber(item.sugar ?? item.sugars),
      salt:calculatorNumber(item.salt),
      fiber:calculatorNumber(item.fiber ?? item.fibre)
    };
  }

  calcInput?.addEventListener("input",saveCalculatorDraft);
  calcAdd?.addEventListener("click",()=>{
    const text=calcInput.value.trim();if(!text){showButtonState(calcAdd,"Немає даних","error",1500);logAction("Додавання в калькулятор не виконано: поле порожнє.");return;}
    const items=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(parseCalculatorLine).filter(Boolean).map(normalizeCalculatorItem);
    saveUndoSnapshot(`Додавання ${items.length} записів у калькулятор`);
    calculatorItems.push(...items);saveCalculatorLocal();renderCalculatorLog();updateTotals();calcInput.value="";localStorage.removeItem(CALCULATOR_DRAFT_KEY);showButtonState(calcAdd,"Додано","success",1500); logAction(`У калькулятор додано записів: ${items.length}.`);
  });
  calcSection?.addEventListener("click",()=>{saveUndoSnapshot("Додавання розділу в калькулятор");calculatorItems.push({text:"/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/",kcal:0,protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0});saveCalculatorLocal();renderCalculatorLog();showButtonState(calcSection,"Додано","success",1500);logAction("У калькулятор додано розділ.");});
  calcClearText?.addEventListener("click",()=>{if(!calcInput.value.trim()){showButtonState(calcClearText,"Немає даних","error",1500);logAction("Очищення тексту не виконано: поле вже порожнє.");return;}saveUndoSnapshot("Очищення тексту калькулятора");calcInput.value="";localStorage.removeItem(CALCULATOR_DRAFT_KEY);showButtonState(calcClearText,"Очищено","success",1500);logAction("Поле введення калькулятора очищено.");});
  calcClearBlocks?.addEventListener("click",()=>{if(!calculatorItems.length){showButtonState(calcClearBlocks,"Немає даних","error",1500);logAction("Очищення історії калькулятора не виконано: історія порожня.");return;}if(!confirm("Очистити всю історію калькулятора?")){showButtonState(calcClearBlocks,"Не очищено","error",1500);logAction("Очищення історії калькулятора скасовано.");return;}saveUndoSnapshot("Очищення історії калькулятора");calculatorItems=[];saveCalculatorLocal();renderCalculatorLog();updateTotals();showButtonState(calcClearBlocks,"Очищено","success",1500);logAction("Історію калькулятора очищено.");});
  function updateTotals(){
    let repaired=false;
    const t=calculatorItems.reduce((a,raw,index)=>{
      const i=normalizeCalculatorItem(raw);
      if(i&&raw&&JSON.stringify(i)!==JSON.stringify(raw)){calculatorItems[index]=i;repaired=true;}
      for(const k of ["kcal","protein","fat","carb","sugar","salt","fiber"])a[k]+=calculatorNumber(i?.[k]);
      return a;
    },{kcal:0,protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0});
    if(repaired)saveCalculatorLocal();
    kcalElement.textContent=formatNumber(t.kcal);proteinElement.textContent=formatNumber(t.protein);fatElement.textContent=formatNumber(t.fat);carbElement.textContent=formatNumber(t.carb);sugarElement.textContent=formatNumber(t.sugar);saltElement.textContent=formatNumber(t.salt);fiberElement.textContent=formatNumber(t.fiber);updateDailyGoalRemaining();
  }
  function renderCalculatorLog(){
    calcLog.innerHTML="";
    calcLog.classList.toggle("calc-history-reorder-mode",calculatorReorderMode);
    if(!calculatorItems.length){calcLog.innerHTML='<div style="padding:10px 0;">Історія порожня.</div>';return;}
    calculatorItems.forEach((item,index)=>{
      const row=document.createElement("div");row.className="log-item calc-log-item";row.dataset.index=String(index);
      const text=document.createElement("span");text.className="calc-log-text";text.textContent=item.text||item.name||"";
      const remove=document.createElement("button");remove.className="remove";remove.textContent="Видалити";remove.onclick=()=>{const removed=calculatorItems[index];saveUndoSnapshot(`Видалення запису з калькулятора`);calculatorItems.splice(index,1);saveCalculatorLocal();renderCalculatorLog();updateTotals();logAction(`З калькулятора видалено: ${removed?.text||removed?.name||"запис"}.`);};
      const move=document.createElement("div");move.className="calc-history-move";
      const up=document.createElement("button");up.className="calc-move-button";up.textContent="↑";up.title="Перемістити вище";up.disabled=index===0;
      const down=document.createElement("button");down.className="calc-move-button";down.textContent="↓";down.title="Перемістити нижче";down.disabled=index===calculatorItems.length-1;
      up.onclick=()=>{if(index<=0)return;if(!calculatorReorderChanged)saveUndoSnapshot("Зміна розташування історії калькулятора");[calculatorItems[index-1],calculatorItems[index]]=[calculatorItems[index],calculatorItems[index-1]];calculatorReorderChanged=true;renderCalculatorLog();};
      down.onclick=()=>{if(index>=calculatorItems.length-1)return;if(!calculatorReorderChanged)saveUndoSnapshot("Зміна розташування історії калькулятора");[calculatorItems[index],calculatorItems[index+1]]=[calculatorItems[index+1],calculatorItems[index]];calculatorReorderChanged=true;renderCalculatorLog();};
      move.append(up,down);
      const actions=document.createElement("div");actions.className="calc-log-actions";actions.append(remove,move);
      row.append(text,actions);calcLog.append(row);
    });
  }
  reorderCalculatorHistory?.addEventListener("click",()=>{
    if(!calculatorItems.length){showButtonState(reorderCalculatorHistory,"Немає історії","error",1600);logAction("Зміну розташування історії не розпочато: історія порожня.");return;}
    if(!calculatorReorderMode){
      calculatorReorderMode=true;calculatorReorderChanged=false;
      setButtonStatusPermanent(reorderCalculatorHistory,"Готово","info");
      renderCalculatorLog();
      logAction("Розпочато зміну розташування історії калькулятора.");
      return;
    }
    calculatorReorderMode=false;
    if(calculatorReorderChanged){
      saveCalculatorLocal();updateTotals();renderCalculatorLog();
      showButtonState(reorderCalculatorHistory,"Розташування змінено","success",1800);
      logAction("Розташування історії калькулятора змінено.");
    }else{
      renderCalculatorLog();
      showButtonState(reorderCalculatorHistory,"Розташування не змінено","error",1800);
      logAction("Зміну розташування історії калькулятора завершено без змін.");
    }
  });
  function getTotalSummary(){return `Денний підсумок: ${kcalElement.textContent} калорій / ${proteinElement.textContent} білка / ${fatElement.textContent} жирів / ${carbElement.textContent} вуглеводів / ${sugarElement.textContent} цукрів / ${saltElement.textContent} солі / ${fiberElement.textContent} клітковини`;}
  copyTotal?.addEventListener("click",async()=>{if(await copyText(getTotalSummary()))showButtonState(copyTotal,"Скопійовано","success",1500);logAction("Денний підсумок скопійовано.");});
  function getCurrentDate(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;}
  saveArchive?.addEventListener("click",()=>{if(!calculatorItems.length){showButtonState(saveArchive,"Немає даних","error",1500);logAction("Збереження в архів не виконано: калькулятор порожній.");return alert("Немає даних для збереження в архів.");}saveUndoSnapshot("Збереження денного підсумку в архів");archiveItems.unshift({id:createId("archive"),date:getCurrentDate(),text:getTotalSummary(),kcal:number(kcalElement.textContent),protein:number(proteinElement.textContent),fat:number(fatElement.textContent),carb:number(carbElement.textContent),sugar:number(sugarElement.textContent),salt:number(saltElement.textContent),fiber:number(fiberElement.textContent),created_at:new Date().toISOString()});saveArchiveLocal();renderArchive();renderStatistics();showButtonState(saveArchive,"Збережено","success",1500);logAction("Денний підсумок збережено в архів.");});
  function formatArchiveDate(v){const m=String(v||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}.${m[2]}.${m[1]}`:v;}
  function renderArchive(){
    updateSiteDataCounts();
    archiveLog.innerHTML="";if(!archiveItems.length){archiveLog.innerHTML='<div style="padding:10px 0;">Архів порожній.</div>';return;}
    archiveItems.forEach(item=>{
      const row=document.createElement("div");row.className="log-item archive-item";
      const content=document.createElement("div");content.className="archive-content";
      const date=document.createElement("div");date.style.fontWeight="600";date.style.color="var(--text-main)";date.textContent=formatArchiveDate(item.date);
      const text=document.createElement("div");text.textContent=item.text;content.append(date,text);
      const actions=document.createElement("div");actions.className="archive-actions";
      const ed=document.createElement("button");ed.className="edit-date";ed.textContent="Дата";
      const et=document.createElement("button");et.className="edit-text";et.textContent="Текст";
      const rm=document.createElement("button");rm.className="remove";rm.textContent="Видалити";
      ed.onclick=()=>editArchiveDate(item,date);et.onclick=()=>openArchiveTextModal(item);rm.onclick=()=>{if(confirm("Видалити цей запис з архіву?")){saveUndoSnapshot("Видалення запису з архіву");archiveItems=archiveItems.filter(a=>a.id!==item.id);saveArchiveLocal();renderArchive();renderStatistics();logAction("Запис видалено з архіву.");}else{showButtonState(rm,"Не видалено","error",1500);logAction("Видалення запису з архіву скасовано.");}};
      actions.append(ed,et,rm);row.append(content,actions);archiveLog.append(row);
    });
  }
  function editArchiveDate(item,dateElement){
    if(dateElement.querySelector("input"))return;const original=item.date||"";const input=document.createElement("input");input.type="date";input.className="archive-date-input";input.value=original||getCurrentDate();dateElement.textContent="";dateElement.append(input);input.focus();
    let done=false;const finish=()=>{if(done)return;done=true;if(input.value&&input.value!==original){saveUndoSnapshot("Зміна дати запису архіву");item.date=input.value;saveArchiveLocal();logAction(`Дата запису архіву змінена з ${original} на ${input.value}.`);renderStatistics();}else{logAction("Зміну дати архіву завершено без змін.");}renderArchive();};input.addEventListener("change",finish,{once:true});input.addEventListener("blur",finish,{once:true});
  }
  function openArchiveTextModal(item){archiveEditingId=item.id;archiveOriginalText=item.text||"";archiveTextInput.value=item.text||"";archiveTextModal.classList.add("active");setTimeout(()=>archiveTextInput.focus(),50);}
  function closeArchiveTextModal(){archiveEditingId=null;archiveOriginalText=null;archiveTextModal.classList.remove("active");}
  archiveTextCancel?.addEventListener("click",()=>{closeArchiveTextModal();showButtonState(archiveTextCancel,"Скасовано","error",1500);logAction("Редагування тексту архіву скасовано.");});
  archiveTextModal?.addEventListener("click",e=>{if(e.target===archiveTextModal)closeArchiveTextModal();});
  archiveTextSave?.addEventListener("click",()=>{const item=archiveItems.find(a=>a.id===archiveEditingId);if(!item)return closeArchiveTextModal();const text=archiveTextInput.value.trim();if(!text)return archiveTextInput.focus();if(text!==archiveOriginalText){saveUndoSnapshot("Зміна тексту запису архіву");item.text=text;saveArchiveLocal();renderArchive();showButtonState(archiveTextSave,"Збережено","success",1500);logAction("Текст запису архіву змінено.");}else{showButtonState(archiveTextSave,"Не змінено","error",1500);logAction("Текст запису архіву залишено без змін.");}closeArchiveTextModal();});

  function parseArchiveMetrics(item){
    const result={kcal:number(item.kcal),protein:number(item.protein),fat:number(item.fat),carb:number(item.carb),sugar:number(item.sugar),salt:number(item.salt),fiber:number(item.fiber)};
    if(Object.values(result).some(v=>v!==0))return result;
    const t=String(item.text||"");
    const patterns={kcal:/([\d.,]+)\s*(?:калорій|ккал)/i,protein:/([\d.,]+)\s*білка/i,fat:/([\d.,]+)\s*жирів/i,carb:/([\d.,]+)\s*вуглеводів/i,sugar:/([\d.,]+)\s*цукрів/i,salt:/([\d.,]+)\s*солі/i,fiber:/([\d.,]+)\s*клітковини/i};
    for(const [k,re] of Object.entries(patterns)){const m=t.match(re);if(m)result[k]=number(m[1].replace(",","."));}
    return result;
  }
  function setupStatisticsDates(){
    const dates=archiveItems.map(i=>i.date).filter(Boolean).sort();
    if(!dates.length)return;
    if(!statsFrom.value)statsFrom.value=dates[0];
    if(!statsTo.value)statsTo.value=dates[dates.length-1];
  }
  function statsMetricLabel(){
    return ({kcal:"Калорії",protein:"Білки",fat:"Жири",carb:"Вуглеводи",sugar:"Цукри",salt:"Сіль",fiber:"Клітковина"})[statsMetric]||statsMetric;
  }
  function formatStatsDate(iso){const [y,m,d]=String(iso).split("-");return `${d}.${m}.${y}`;}
  function renderMonthlyArchiveSummary(){
    if(!statsMonthSummary)return;
    const now=new Date(),year=now.getFullYear(),month=now.getMonth();
    const prefix=`${year}-${String(month+1).padStart(2,"0")}-`;
    const recordedDays=new Set(archiveItems.map(i=>String(i.date||"")).filter(d=>d.startsWith(prefix))).size;
    const daysInMonth=new Date(year,month+1,0).getDate();
    const monthLabel=new Intl.DateTimeFormat("uk-UA",{month:"long"}).format(now).toLowerCase();
    statsMonthSummary.textContent=`${year} рік, ${monthLabel}: записано ${recordedDays} днів з ${daysInMonth}.`;
  }
  function renderStatistics(){
    renderMonthlyArchiveSummary();
    if(!statsChart)return;
    const archivePage=document.getElementById("archive");
    if(!archivePage?.classList.contains("active"))return;
    setupStatisticsDates();
    const from=statsFrom.value||"0000-01-01",to=statsTo.value||"9999-12-31";
    const points=archiveItems.filter(i=>i.date>=from&&i.date<=to).map(i=>({date:i.date,value:parseArchiveMetrics(i)[statsMetric]})).sort((a,b)=>a.date.localeCompare(b.date));
    const ctx=statsChart.getContext("2d"),rect=statsChart.getBoundingClientRect(),dpr=window.devicePixelRatio||1,w=Math.max(300,rect.width),h=Math.max(260,rect.height);
    statsChart.width=w*dpr;statsChart.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    statsRenderedPoints=[];statsChartGeometry=null;if(statsTooltip)statsTooltip.classList.remove("active");
    if(points.length<3){statsEmpty.style.display="flex";return;}statsEmpty.style.display="none";
    const vals=points.map(p=>p.value),rawMin=Math.min(...vals),rawMax=Math.max(...vals),rawRange=rawMax-rawMin||Math.max(Math.abs(rawMax)*.1,1),margin=rawRange*.12;
    const min=Math.max(0,rawMin-margin),max=rawMax+margin,range=max-min||1;
    const pad={l:58,r:18,t:18,b:48},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
    const css=getComputedStyle(document.documentElement),primary=css.getPropertyValue("--primary-color").trim(),secondary=css.getPropertyValue("--text-secondary").trim(),gridColor=css.getPropertyValue("--bg-card").trim(),bodyStyle=getComputedStyle(document.body);
    ctx.font=`11px ${bodyStyle.fontFamily}`;ctx.lineWidth=1;ctx.strokeStyle=gridColor;ctx.fillStyle=secondary;
    const yTicks=6;
    for(let i=0;i<=yTicks;i++){const y=pad.t+ch*i/yTicks;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();ctx.textAlign="right";ctx.fillText(formatNumber(max-range*i/yTicks),pad.l-7,y+4);}
    const coords=points.map((p,i)=>({x:pad.l+(points.length===1?cw/2:cw*i/(points.length-1)),y:pad.t+ch*(max-p.value)/range,...p}));
    const xStep=Math.max(1,Math.ceil(points.length/(w<520?4:7)));
    coords.forEach((p,i)=>{if(i%xStep===0||i===coords.length-1){ctx.strokeStyle=gridColor;ctx.beginPath();ctx.moveTo(p.x,pad.t);ctx.lineTo(p.x,h-pad.b);ctx.stroke();ctx.fillStyle=secondary;ctx.textAlign="center";ctx.fillText(p.date.slice(8,10)+"."+p.date.slice(5,7),p.x,h-18);}});
    ctx.strokeStyle=primary;ctx.lineWidth=2;ctx.beginPath();coords.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
    ctx.fillStyle="#ef4444";coords.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,4.5,0,Math.PI*2);ctx.fill();});
    statsRenderedPoints=coords;statsChartGeometry={w,h,pad};
  }
  function inspectStatisticsPoint(clientX,clientY){
    if(!statsRenderedPoints.length||!statsTooltip)return;
    const rect=statsChart.getBoundingClientRect(),x=clientX-rect.left,y=clientY-rect.top;
    let nearest=statsRenderedPoints[0],dist=Infinity;
    statsRenderedPoints.forEach(p=>{const d=Math.hypot(p.x-x,p.y-y);if(d<dist){dist=d;nearest=p;}});
    const ctx=statsChart.getContext("2d"),g=statsChartGeometry;if(!g)return;
    renderStatistics();
    ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle="rgba(220,221,222,.65)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(nearest.x,g.pad.t);ctx.lineTo(nearest.x,g.h-g.pad.b);ctx.moveTo(g.pad.l,nearest.y);ctx.lineTo(g.w-g.pad.r,nearest.y);ctx.stroke();ctx.restore();
    ctx.fillStyle="#ef4444";ctx.beginPath();ctx.arc(nearest.x,nearest.y,6.5,0,Math.PI*2);ctx.fill();
    statsTooltip.innerHTML=`<strong>${formatNumber(nearest.value)} ${statsMetric==="kcal"?"калорій":"г"}</strong><span>${formatStatsDate(nearest.date)} · ${statsMetricLabel()}</span>`;
    const wrap=statsChart.parentElement,tw=statsTooltip.offsetWidth||160,th=statsTooltip.offsetHeight||54;
    statsTooltip.style.left=`${Math.max(8,Math.min(wrap.clientWidth-tw-8,nearest.x+14))}px`;
    statsTooltip.style.top=`${Math.max(8,Math.min(wrap.clientHeight-th-8,nearest.y-th-10))}px`;statsTooltip.classList.add("active");
  }
  statsChart?.addEventListener("mousemove",e=>inspectStatisticsPoint(e.clientX,e.clientY));
  function medicineTodayRecord(){ return medicineArchive.find(r=>r.date===getCurrentDate()); }
  function closeMedicineModal(modal){modal?.classList.remove("active");modal?.setAttribute("aria-hidden","true");document.body.classList.remove("edit-modal-open");}
  function openMedicineForm(modal){modal?.classList.add("active");modal?.setAttribute("aria-hidden","false");document.body.classList.add("edit-modal-open");setTimeout(()=>modal?.querySelector("input")?.focus(),50);}
  function closeMedicineSelectModal(){closeMedicineModal(medicineSelectModal);}
  function medicineDetail(m){return [m.name,m.dose,m.full_name].filter(Boolean).join(" · ");}
  function openMedicineSelectModal(){
    if(!medicines.length){showButtonState(medicineOpenToday,"Немає ліків","error",1500);logAction("Вибір ліків не відкрито: база ліків порожня.");return;}
    const today=medicineTodayRecord(),taken=new Set(Array.isArray(today?.taken_ids)?today.taken_ids:[]);medicineSelectList.innerHTML="";
    medicines.forEach(m=>{const row=document.createElement("div");row.className="medicine-row medicine-select-row";const label=document.createElement("label");label.className="medicine-check";const check=document.createElement("input");check.type="checkbox";check.checked=taken.has(m.id);check.dataset.id=m.id;const text=document.createElement("span");text.innerHTML=`<strong>${escapeHtml(m.name)}</strong>${m.dose?`<small>${escapeHtml(m.dose)}</small>`:""}`;label.append(check,text);row.append(label);medicineSelectList.append(row);});
    openMedicineForm(medicineSelectModal);
  }
  function renderMedicineCard(m,container,kind){const row=document.createElement("div");row.className="medicine-row medicine-base-item";const info=document.createElement("div");info.className="medicine-info";info.innerHTML=`<strong>${escapeHtml(m.name)}</strong>${m.dose?`<span>Дозування: ${escapeHtml(m.dose)}</span>`:""}${m.full_name?`<small>${escapeHtml(m.full_name)}</small>`:""}`;const remove=document.createElement("button");remove.type="button";remove.className="medicine-remove";remove.textContent="Видалити";remove.onclick=()=>{const label=kind==="buy"?"зі списку покупок":"з бази ліків";if(!confirm(`Видалити «${m.name}» ${label}?`)){showButtonState(remove,"Не видалено","error",1300);logAction(`Видалення «${m.name}» скасовано.`);return;}if(kind==="buy"){medicineBuy=medicineBuy.filter(x=>x.id!==m.id);saveMedicineBuyLocal();}else{medicines=medicines.filter(x=>x.id!==m.id);saveMedicinesLocal();}renderMedicines();logAction(`Видалено «${m.name}» ${label}.`);};row.append(info,remove);container.append(row);}
  function renderMedicines(){
    if(!medicineBaseList||!medicineHistory)return;const today=medicineTodayRecord();medicineBaseList.innerHTML="";medicineBuyList.innerHTML="";
    if(!medicines.length)medicineBaseList.innerHTML='<div class="medicine-empty">База ліків порожня.</div>';else medicines.forEach(m=>renderMedicineCard(m,medicineBaseList,"base"));
    if(!medicineBuy.length)medicineBuyList.innerHTML='<div class="medicine-empty">Список покупок порожній.</div>';else medicineBuy.forEach(m=>renderMedicineCard(m,medicineBuyList,"buy"));
    if(!medicines.length)medicineTodaySummary.textContent="Спочатку додайте ліки до своєї бази.";else if(!today)medicineTodaySummary.textContent="За сьогодні ліки ще не записані.";else{const names=today.taken_names||[];medicineTodaySummary.textContent=names.length?`Сьогодні записано: ${names.join(", ")}.`:"За сьогодні жодні ліки не відмічені як прийняті.";}
    medicineHistory.innerHTML="";if(!medicineArchive.length){medicineHistory.innerHTML='<div class="medicine-empty">Архів ліків порожній.</div>';return;}
    [...medicineArchive].sort((a,b)=>String(b.date).localeCompare(String(a.date))).forEach(r=>{const all=r.all_names||[],taken=r.taken_names||[],missed=all.filter(n=>!taken.includes(n));let status="Ліки зовсім не записані.";if(all.length&&taken.length===all.length)status="Всі ліки записано.";else if(taken.length)status=`Записані: ${taken.join(", ")}. Не записані: ${missed.join(", ")||"—"}.`;const row=document.createElement("div");row.className="medicine-history-item";const content=document.createElement("div");const date=document.createElement("strong");date.textContent=formatArchiveDate(r.date);const text=document.createElement("div");text.textContent=status;content.append(date,text);const actions=document.createElement("div");actions.className="archive-actions medicine-history-actions";const dateBtn=document.createElement("button");dateBtn.textContent="Дата";const del=document.createElement("button");del.className="remove";del.textContent="Видалити";dateBtn.onclick=()=>editMedicineDate(r,date);del.onclick=()=>{if(!confirm("Видалити цей запис з архіву ліків?")){showButtonState(del,"Не видалено","error",1300);logAction("Видалення запису архіву ліків скасовано.");return;}medicineArchive=medicineArchive.filter(x=>x!==r);saveMedicineArchiveLocal();renderMedicines();logAction("Запис видалено з архіву ліків.");};actions.append(dateBtn,del);row.append(content,actions);medicineHistory.append(row);});
  }
  function editMedicineDate(item,dateElement){if(dateElement.querySelector("input"))return;const original=item.date||"";const input=document.createElement("input");input.type="date";input.className="archive-date-input";input.value=original||getCurrentDate();dateElement.textContent="";dateElement.append(input);input.focus();let done=false;const finish=()=>{if(done)return;done=true;if(input.value&&input.value!==original){item.date=input.value;saveMedicineArchiveLocal();logAction(`Дата запису архіву ліків змінена з ${original} на ${input.value}.`);}else logAction("Зміну дати архіву ліків завершено без змін.");renderMedicines();};input.addEventListener("change",finish,{once:true});input.addEventListener("blur",finish,{once:true});}
  medicineOpenAdd?.addEventListener("click",()=>openMedicineForm(medicineAddModal));
  medicineAddCancel?.addEventListener("click",()=>{closeMedicineModal(medicineAddModal);showButtonState(medicineAddCancel,"Скасовано","error",1200);});
  medicineAddSave?.addEventListener("click",()=>{const name=medicineFormName.value.trim(),dose=medicineFormDose.value.trim(),full_name=medicineFormFull.value.trim();if(!name||!dose||!full_name){showButtonState(medicineAddSave,"Заповніть поля","error",1500);return;}if(medicines.some(m=>m.name.toLowerCase()===name.toLowerCase())){showButtonState(medicineAddSave,"Вже є","error",1400);return;}medicines.push({id:createId("medicine"),name,dose,full_name,created_at:new Date().toISOString()});saveMedicinesLocal();[medicineFormName,medicineFormDose,medicineFormFull].forEach(x=>x.value="");closeMedicineModal(medicineAddModal);renderMedicines();showButtonState(medicineOpenAdd,"Додано","success",1400);logAction(`Додано ліки «${name}».`);});
  medicineOpenBuyAdd?.addEventListener("click",()=>openMedicineForm(medicineBuyModal));medicineBuyCancel?.addEventListener("click",()=>{closeMedicineModal(medicineBuyModal);showButtonState(medicineBuyCancel,"Скасовано","error",1200);});
  medicineBuySave?.addEventListener("click",()=>{const name=medicineBuyName.value.trim(),dose=medicineBuyDose.value.trim(),full_name=medicineBuyFull.value.trim();if(!name||!dose||!full_name){showButtonState(medicineBuySave,"Заповніть поля","error",1500);return;}medicineBuy.push({id:createId("buy"),name,dose,full_name,created_at:new Date().toISOString()});saveMedicineBuyLocal();[medicineBuyName,medicineBuyDose,medicineBuyFull].forEach(x=>x.value="");closeMedicineModal(medicineBuyModal);renderMedicines();showButtonState(medicineOpenBuyAdd,"Додано","success",1400);logAction(`До списку покупок додано «${name}».`);});
  medicineClearAll?.addEventListener("click",()=>{if(!medicines.length){showButtonState(medicineClearAll,"База порожня","error",1300);return;}if(!confirm("Ви справді бажаєте очистити всю базу даних ліків?")){showButtonState(medicineClearAll,"Скасовано","error",1400);logAction("Очищення бази ліків скасовано.");return;}medicines=[];saveMedicinesLocal();renderMedicines();showButtonState(medicineClearAll,"Очищено","success",1400);logAction("Базу ліків повністю очищено.");});
  medicineOpenToday?.addEventListener("click",openMedicineSelectModal);medicineSelectCancel?.addEventListener("click",()=>{closeMedicineSelectModal();showButtonState(medicineSelectCancel,"Скасовано","error",1200);});medicineSelectModal?.addEventListener("click",e=>{if(e.target===medicineSelectModal)closeMedicineSelectModal();});
  medicineSaveDay?.addEventListener("click",()=>{if(!medicines.length)return;const checked=[...medicineSelectList.querySelectorAll('input[type="checkbox"]:checked')].map(x=>x.dataset.id),allNames=medicines.map(m=>m.name),takenNames=medicines.filter(m=>checked.includes(m.id)).map(m=>m.name),rec={date:getCurrentDate(),taken_ids:checked,all_names:allNames,taken_names:takenNames,updated_at:new Date().toISOString()};const i=medicineArchive.findIndex(r=>r.date===rec.date);if(i>=0)medicineArchive[i]=rec;else medicineArchive.unshift(rec);saveMedicineArchiveLocal();closeMedicineSelectModal();renderMedicines();showButtonState(medicineOpenToday,"Додано","success",1500);logAction("Ліки за сьогодні записано в архів.");});

  statsChart?.addEventListener("mouseleave",()=>{statsTooltip?.classList.remove("active");renderStatistics();});
  statsChart?.addEventListener("click",e=>inspectStatisticsPoint(e.clientX,e.clientY));
  statsChart?.addEventListener("touchstart",e=>{const t=e.touches[0];if(t)inspectStatisticsPoint(t.clientX,t.clientY);},{passive:true});
  statsMetricButtons.forEach(button=>button.addEventListener("click",()=>{statsMetric=button.dataset.metric;statsMetricButtons.forEach(b=>b.classList.toggle("active",b===button));renderStatistics();showButtonState(button,button.dataset.originalText||button.textContent,"success",800);logAction(`Статистику перемкнено на показник «${button.dataset.originalText||button.textContent}».`);}));
  [statsFrom,statsTo].forEach(input=>input?.addEventListener("change",()=>{if(statsFrom.value&&statsTo.value){const days=Math.round((new Date(statsTo.value)-new Date(statsFrom.value))/86400000);if(days<3){showButtonState(input===statsFrom?statsMetricButtons[0]:statsMetricButtons[0],"Мінімум 3 дні","error",1200);logAction("Період статистики не змінено: мінімальний період 3 дні.");return;}}renderStatistics();logAction(`Період статистики змінено: ${statsFrom.value||"початок"} — ${statsTo.value||"кінець"}.`);}));
  window.addEventListener("resize",()=>{if(document.getElementById("archive")?.classList.contains("active"))renderStatistics();});

  refreshSiteButton?.addEventListener("click",async()=>{
    showButtonState(refreshSiteButton,"Оновлення...","success",0);
    logAction("Refresh: запущено оновлення сайту до актуальної версії.");
    try{
      if("serviceWorker" in navigator){
        const registration=await navigator.serviceWorker.getRegistration();
        if(registration)await registration.update();
      }
      try{
        await fetch(`./index.html?refresh=${Date.now()}`,{cache:"no-store"});
      }catch(_){}
    }catch(error){
      console.warn("Refresh update check failed:",error);
    }
    setTimeout(()=>window.location.reload(),250);
  });

  undoLastAction?.addEventListener("click",applyUndoSnapshot);

  leaveSiteButton?.addEventListener("click",()=>{
    const ok=confirm("Ви справді хочете покинути та очистити весь сайт?\n\nБудуть видалені всі КБЖВ-блоки, калькулятор, архів, статистика, консоль та локальні налаштування цієї програми.");
    if(!ok){showButtonState(leaveSiteButton,"Скасовано","error",1600);logAction("Очищення сайту скасовано.");return;}
    const keys=[PRODUCTS_KEY,CALCULATOR_KEY,ARCHIVE_KEY,ACTIVE_TAB_KEY,CALCULATOR_DRAFT_KEY,SORT_KEY,CONSOLE_KEY,EXPORT_VERSION_KEY,DATABASE_UPDATED_KEY,EXPORT_FINGERPRINT_KEY,DAILY_GOAL_KEY,LAST_EXPORT_KEY,LAST_IMPORT_KEY,UNDO_KEY];
    keys.forEach(k=>localStorage.removeItem(k));
    showButtonState(leaveSiteButton,"Очищено","success",700);
    setTimeout(()=>location.reload(),750);
  });

  document.addEventListener("keydown",e=>{
    if(e.key!=="Escape")return;
    [productModal,addProductModal,editProductModal,sortProductsModal,deleteProductModal,archiveTextModal].forEach(m=>m?.classList.remove("active"));
    selectedProduct=null;editingProduct=null;archiveEditingId=null;document.body.classList.remove("edit-modal-open");
  });
  productWeight?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();productCopy.click();}});
  [newProductName,newProductKcal,newProductProtein,newProductFat,newProductCarb,newProductSugar,newProductSalt,newProductFiber].forEach(i=>i?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addProductSave.click();}}));
  [editProductName,editProductKcal,editProductProtein,editProductFat,editProductCarb,editProductSugar,editProductSalt,editProductFiber].forEach(i=>i?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();editProductSave.click();}}));

  products=loadArray(PRODUCTS_KEY).map((p,i)=>normalizeProduct(p,i));
  calculatorItems=loadArray(CALCULATOR_KEY).map(normalizeCalculatorItem);
  saveCalculatorLocal();
  archiveItems=loadArray(ARCHIVE_KEY);
  consoleItems=loadArray(CONSOLE_KEY);
  const draft=localStorage.getItem(CALCULATOR_DRAFT_KEY);if(draft!==null)calcInput.value=draft;
  loadDailyGoal();
  renderProducts();renderCalculatorLog();updateTotals();renderArchive();renderConsole();renderStatistics();updateSiteDataCounts();setInterval(updateSiteDataCounts,60000);

  const saved=localStorage.getItem(ACTIVE_TAB_KEY)||"blocks";
  tabs.forEach(t=>t.classList.toggle("active",t.dataset.tab===saved));
  pages.forEach(p=>p.classList.toggle("active",p.id===saved));
  if(saved==="archive")requestAnimationFrame(()=>renderStatistics());
});

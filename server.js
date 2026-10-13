const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "data.json");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const seed = {
  packages: [
    {id:"basic",name:"Basic Retailer",amount:1150,daily:45,roi:3.91,cap:5750},
    {id:"standard",name:"Standard Retailer",amount:2250,daily:100,roi:4.44,cap:11250},
    {id:"pro",name:"Pro Retailer",amount:4500,daily:250,roi:5.56,cap:22500},
    {id:"master",name:"Master Distributor",amount:11500,daily:700,roi:6.09,cap:57500},
    {id:"super",name:"Super Distributor",amount:22500,daily:1800,roi:8,cap:112500}
  ],
  users: [
    {id:"U1001",name:"Demo Retailer",role:"retailer",packageId:"basic",wallet:1150,eligibleIncome:0,createdAt:new Date().toISOString()},
    {id:"A0001",name:"Demo Admin",role:"admin",packageId:null,wallet:0,eligibleIncome:0,createdAt:new Date().toISOString()}
  ],
  transactions: [],
  ledger: [{id:"L1001",userId:"U1001",type:"Package Demo Credit",amount:1150,status:"SIMULATED",createdAt:new Date().toISOString(),note:"Seed demo balance"}],
  settings: {mode:"DEMO",minPayout:300,bankChargePercent:10,walletTransferPercent:0,settlement:"Monday-Friday, 10 AM-5 PM"},
  applications: []
};
function load(){ if(!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE,JSON.stringify(seed,null,2)); try{return JSON.parse(fs.readFileSync(DB_FILE,"utf8"));}catch(e){return structuredClone(seed);} }
let db=load();
function save(){fs.writeFileSync(DB_FILE,JSON.stringify(db,null,2));}
function user(id){return db.users.find(u=>u.id===id);}
function safeUser(u){if(!u)return null;return {id:u.id,name:u.name,role:u.role,packageId:u.packageId,wallet:u.wallet,eligibleIncome:u.eligibleIncome};}
function requireUser(req,res,next){const id=req.header("x-demo-user")||"U1001";const u=user(id);if(!u)return res.status(401).json({error:"Unknown demo user"});req.user=u;next();}
function requireAdmin(req,res,next){const id=req.header("x-demo-user")||"U1001";const u=user(id);if(!u||u.role!=="admin")return res.status(403).json({error:"Admin demo user required"});req.user=u;next();}
function id(prefix){return prefix+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase();}
function log(userId,type,amount,status,note){db.ledger.unshift({id:id("L"),userId,type,amount,status,createdAt:new Date().toISOString(),note});}
app.get("/api/health",(req,res)=>res.json({ok:true,mode:"DEMO",message:"Simulated data only"}));
app.get("/api/packages",(req,res)=>res.json(db.packages));
app.get("/api/me",requireUser,(req,res)=>res.json({user:safeUser(req.user),pkg:db.packages.find(p=>p.id===req.user.packageId)||null,settings:db.settings}));
app.get("/api/ledger",requireUser,(req,res)=>res.json(db.ledger.filter(x=>x.userId===req.user.id).slice(0,100)));
app.get("/api/transactions",requireUser,(req,res)=>res.json(db.transactions.filter(x=>x.userId===req.user.id).slice(0,100)));
app.get("/api/team-income",(req,res)=>res.json({
  onboarding:[["Level 1","Direct Agent","10%"],["Level 2","Sub-Agent","3%"],["Level 3","Merchant Associate","2%"]],
  turnover:[["Level 1","10%"],["Level 2","6%"],["Level 3","4%"],["Level 4","3%"],["Level 5","2%"],["Levels 6–8","1.5% each"],["Levels 9–11","1% each"]],
  sources:[
    ["1","Daily Wallet Income","Package-based daily amount for 30-day cycle; subject to 5X cap"],
    ["2","Agent Onboarding Commission","L1 10%; L2 3%; L3 2%"],
    ["3","Recharge Service Commission","Mobile 2.5% proposed; DTH 2.5% proposed; utilities actual provider commission"],
    ["4","11-Level Team Business Sharing","L1 10%; L2 6%; L3 4%; L4 3%; L5 2%; L6–8 1.5% each; L9–11 1% each"],
    ["5","Fast Expansion Booster","3 direct agents within 7 days; +1.5 percentage-point margin for 30 days, proposed"],
    ["6","Daily Channel Royalty Pool","Distributor 2%; Master 1.5%; Zonal Head 1%, at business targets"],
    ["7","Performance Rewards","₹2,000 / ₹6,000 / ₹25,000 / ₹75,000 milestone rewards"],
    ["8","Recharge Transaction Override","L1 0.40%; L2 0.20%; L3 0.10%; L4–11 0.05% each"],
    ["9","Wallet Renewal Bonus","5% promotional float balance on eligible renewal, proposed"],
    ["10","Overall 5X Income Cap","Package-based eligible income capped at 5× package amount. Written policy must define treatment of other commissions/rewards."],
    ["11","Payout Rules","Minimum ₹300; bank transfer charge 10% proposed; wallet transfer 0% proposed; weekdays 10 AM–5 PM"]
  ]
}));
app.post("/api/recharge",requireUser,(req,res)=>{
  const {service,consumer,operator,amount}=req.body;
  const n=Number(amount);
  if(!["Mobile Recharge","DTH Recharge","Utility Bill"].includes(service)||!consumer||String(consumer).length<4||!Number.isFinite(n)||n<10||n>5000)return res.status(400).json({error:"Enter valid demo recharge details (₹10–₹5,000)."});
  const t={id:id("TX"),userId:req.user.id,service,consumer:String(consumer).replace(/[<>]/g,""),operator:String(operator||"Demo Operator"),amount:n,status:"SIMULATED — NOT SENT",createdAt:new Date().toISOString()};
  db.transactions.unshift(t);log(req.user.id,"Simulated "+service,n,"SIMULATED","Not sent to any provider");save();res.json(t);
});
app.post("/api/income/simulate",requireUser,(req,res)=>{
  const p=db.packages.find(x=>x.id===req.user.packageId);
  if(!p)return res.status(400).json({error:"Select a package first."});
  const left=Math.max(0,p.cap-req.user.eligibleIncome);
  if(left<=0)return res.status(409).json({error:"5X cap reached for this demo cycle.",user:safeUser(req.user)});
  const amount=Math.min(p.daily,left);
  req.user.eligibleIncome+=amount;req.user.wallet+=amount;
  log(req.user.id,"Simulated Daily Income",amount,"SIMULATED","Package-based demo income; cap enforced");
  save();res.json({amount,user:safeUser(req.user),pkg:p});
});
app.post("/api/cycle/reset",requireUser,(req,res)=>{
  const p=db.packages.find(x=>x.id===req.user.packageId);req.user.eligibleIncome=0;req.user.wallet=p?p.amount:0;
  log(req.user.id,"Demo Cycle Reset",0,"SIMULATED","Demo only; reset eligible income and demo wallet");save();res.json({user:safeUser(req.user)});
});
app.post("/api/admin/package",requireAdmin,(req,res)=>{
  const {userId,packageId}=req.body;const u=user(userId);const p=db.packages.find(x=>x.id===packageId);
  if(!u||!p)return res.status(400).json({error:"Select a valid demo user and package."});
  u.packageId=p.id;u.wallet=p.amount;u.eligibleIncome=0;log(u.id,"Admin changed demo package",p.amount,"SIMULATED",p.name);save();res.json({user:safeUser(u),pkg:p});
});
app.get("/api/admin/summary",requireAdmin,(req,res)=>res.json({users:db.users.map(safeUser),transactions:db.transactions,ledger:db.ledger.slice(0,100),settings:db.settings}));
app.post("/api/admin/user",requireAdmin,(req,res)=>{
  const {name,role,packageId}=req.body; if(!name||!["retailer","distributor","admin"].includes(role))return res.status(400).json({error:"Name and valid role required."});
  const p=db.packages.find(x=>x.id===packageId)||db.packages[0];
  const u={id:id("U"),name:String(name).slice(0,80),role,packageId:p.id,wallet:p.amount,eligibleIncome:0,createdAt:new Date().toISOString()};
  db.users.push(u);log(u.id,"Demo account created",p.amount,"SIMULATED","No real money");save();res.json(safeUser(u));
});
app.post("/api/admin/payout-demo",requireAdmin,(req,res)=>{
  const {userId,amount}=req.body,u=user(userId),n=Number(amount);
  if(!u||!Number.isFinite(n)||n<db.settings.minPayout||n>u.wallet)return res.status(400).json({error:"Amount must be at least ₹300 and no more than demo wallet balance."});
  u.wallet-=n;log(u.id,"Simulated payout request",n,"PENDING DEMO","Not sent to bank");save();res.json({ok:true,message:"Demo payout request recorded; no bank transfer was made."});
});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`Multi-Recharge Portal demo running on http://localhost:${PORT}`));

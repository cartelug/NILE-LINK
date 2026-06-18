/* ============================================================
   NILE LINK — data.js
   Mock data model + pure helpers. Swap for a real backend by
   replacing the arrays/objects below and the NL.api facade.
   ============================================================ */
window.NLDATA=(function(){
  const ICONS={
    electronics:'<rect x="6.5" y="2" width="11" height="20" rx="2.6"/><path d="M10.5 18.5h3"/><path d="M9.5 5h5"/>',
    fashion:'<path d="M8.5 3.5L4.5 6.5L7 9.5L8.5 8.5V21H15.5V8.5L17 9.5L19.5 6.5L15.5 3.5"/><path d="M9.5 3.5C9.5 5.2 10.6 6.5 12 6.5C13.4 6.5 14.5 5.2 14.5 3.5"/>',
    cars:'<path d="M3.5 16V11.5L5.4 7.5C5.7 6.7 6.5 6.2 7.3 6.2H16.7C17.5 6.2 18.3 6.7 18.6 7.5L20.5 11.5V16"/><path d="M3.5 11.5H20.5"/><path d="M6.5 16V18H4.5V16"/><path d="M19.5 16V18H17.5V16"/><circle cx="7.5" cy="14.5" r="1.3"/><circle cx="16.5" cy="14.5" r="1.3"/>',
    property:'<path d="M3.5 11L12 3.5L20.5 11"/><path d="M5.5 9.5V20H18.5V9.5"/><path d="M10 20V14.5H14V20"/><path d="M15 12.5H16.5"/>',
    services:'<path d="M14.7 6.3a3.5 3.5 0 0 0-4.8 4.8L4 17l3 3 5.9-5.9a3.5 3.5 0 0 0 4.8-4.8l-2.5 2.5-1.5-1.5z"/><circle cx="15.5" cy="8.5" r=".7"/>'
  };

  const CATEGORIES=[
    {name:'Phones & Electronics',short:'Electronics',key:'electronics',count:'120+ items'},
    {name:'Fashion & Beauty',short:'Fashion',key:'fashion',count:'90+ items'},
    {name:'Cars & Motorbikes',short:'Cars',key:'cars',count:'45+ listings'},
    {name:'Property & Land',short:'Property',key:'property',count:'60+ listings'},
    {name:'Services',short:'Services',key:'services',count:'70+ providers'}
  ];
  const CATLABEL={electronics:'Phones & Electronics',fashion:'Fashion & Beauty',cars:'Cars & Motorbikes',property:'Property & Land',services:'Services'};
  const typeForCat=k=>k==='services'?'quote':(k==='cars'||k==='property')?'contact':'order';
  const groupForCat=k=>k==='services'?'services':(k==='cars'||k==='property')?'vehprop':'products';

  const LISTINGS=[
    {id:1,title:'iPhone 13 Pro · 256GB · Clean',cat:'Phones & Electronics',key:'electronics',usd:720,note:'',loc:'Juba, Hai Cinema',seller:'TechHub SS',type:'order',group:'products',badges:['boost','verified'],desc:'iPhone 13 Pro in clean condition, 256GB, battery health 92%. Comes with charger and protective case. Serious buyers only.',img:'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&h=460&fit=crop&auto=format&q=80'},
    {id:2,title:'Toyota Land Cruiser V8 (2016)',cat:'Cars & Motorbikes',key:'cars',usd:42000,note:'',loc:'Juba, Tongping',seller:'Nile Motors',type:'contact',group:'vehprop',badges:['feat','verified'],desc:'2016 Toyota Land Cruiser V8, full option, leather seats, low mileage, well maintained. Inspection welcome at our Tongping yard.',img:'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=460&fit=crop&auto=format&q=80'},
    {id:3,title:'3-Bedroom House · Thongpiny',cat:'Property & Land',key:'property',usd:850,note:'/mo',loc:'Juba, Thongpiny',seller:'Juba Homes',type:'contact',group:'vehprop',badges:['verified'],desc:'Spacious 3-bedroom house in a secure compound. Self-contained, parking for 2 cars, water tank, standby generator.',img:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=460&fit=crop&auto=format&q=80'},
    {id:4,title:'Wedding & Event Photography',cat:'Services',key:'services',usd:150,from:true,note:'',loc:'Juba',seller:'Lensia Studio',type:'quote',group:'services',badges:['boost'],desc:'Professional photography and videography for weddings, graduations and corporate events. Packages from half-day to full coverage with edited album.',img:'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=600&h=460&fit=crop&auto=format&q=80'},
    {id:5,title:'Ankara Two-Piece Set · Custom',cat:'Fashion & Beauty',key:'fashion',usd:35,note:'',loc:'Juba, Konyokonyo',seller:'Achol Styles',type:'order',group:'products',badges:['boost'],desc:'Custom-tailored Ankara two-piece set. Choose your fabric and size. Made to order within 3 days.',img:'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=600&h=460&fit=crop&auto=format&q=80'},
    {id:6,title:'Hisense 3.5KVA Generator',cat:'Phones & Electronics',key:'electronics',usd:410,note:'',loc:'Juba, Gudele',seller:'PowerLine',type:'order',group:'products',badges:[],desc:'Hisense 3.5KVA petrol generator, brand new, fuel efficient with key start. Ideal for home or small shop.',img:'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&h=460&fit=crop&auto=format&q=80'},
    {id:7,title:'Plot of Land 50x100 · Gudele',cat:'Property & Land',key:'property',usd:12000,note:'',loc:'Juba, Gudele',seller:'Equity Lands',type:'contact',group:'vehprop',badges:['verified'],desc:'Residential plot 50x100 in a fast-developing area of Gudele. Clean documents, ready for transfer.',img:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=460&fit=crop&auto=format&q=80'},
    {id:8,title:'Bajaj Boxer Motorbike (2022)',cat:'Cars & Motorbikes',key:'cars',usd:1250,note:'',loc:'Juba, Munuki',seller:'RideMart',type:'contact',group:'vehprop',badges:['boost'],desc:'2022 Bajaj Boxer, single owner, excellent condition, ideal for boda business or personal use.',img:'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=460&fit=crop&auto=format&q=80'},
    {id:9,title:'Home & Office Deep Cleaning',cat:'Services',key:'services',usd:25,from:true,note:'',loc:'Juba',seller:'SparkleCo',type:'quote',group:'services',badges:[],desc:'Reliable home and office cleaning team. One-off or weekly. We bring our own supplies and equipment.',img:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=460&fit=crop&auto=format&q=80'},
    {id:10,title:'Samsung Galaxy A54 · 128GB',cat:'Phones & Electronics',key:'electronics',usd:310,note:'',loc:'Juba, Custom',seller:'TechHub SS',type:'order',group:'products',badges:['verified'],desc:'New Samsung Galaxy A54, 128GB, sealed in box with one year warranty. Multiple colours available.',img:'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=460&fit=crop&auto=format&q=80'},
    {id:11,title:'Custom Cakes & Pastries',cat:'Services',key:'services',usd:20,from:true,note:'',loc:'Juba',seller:'Sweet Nile',type:'quote',group:'services',badges:['boost'],desc:'Custom cakes for birthdays, weddings and events. Order 48 hours ahead. Delivery available in Juba.',img:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=460&fit=crop&auto=format&q=80'},
    {id:12,title:'Men’s Leather Shoes · Italian',cat:'Fashion & Beauty',key:'fashion',usd:45,note:'',loc:'Juba, Jebel',seller:'Step Up',type:'order',group:'products',badges:[],desc:'Genuine leather formal shoes, sizes 40-45. Comfortable and durable. Bulk orders welcome.',img:'https://images.unsplash.com/photo-1614253429340-98120bd6d753?w=600&h=460&fit=crop&auto=format&q=80'}
  ];

  const SHOP=[
    {id:'s1',title:'MacBook Air M1 · 256GB',cat:'Electronics',key:'electronics',usd:640,note:'',status:'draft',pct:60,missing:'Add 2 more photos'},
    {id:'s2',title:'2-Bed Apartment · Juba Na Bari',cat:'Property',key:'property',usd:500,note:'/mo',status:'draft',pct:40,missing:'Add description & price details'},
    {id:'s3',title:'Event Decoration Service',cat:'Services',key:'services',usd:80,from:true,note:'',status:'draft',pct:75,missing:'Set your service areas'},
    {id:'s4',title:'iPhone 13 Pro · 256GB',cat:'Electronics',key:'electronics',usd:720,note:'',status:'live',views:42,reqs:3},
    {id:'s5',title:'Samsung Galaxy A54 · 128GB',cat:'Electronics',key:'electronics',usd:310,note:'',status:'live',views:28,reqs:2},
    {id:'s6',title:'JBL Bluetooth Speaker',cat:'Electronics',key:'electronics',usd:55,note:'',status:'live',views:17,reqs:1},
    {id:'s7',title:'Toyota Hilux Double Cab (2014)',cat:'Cars',key:'cars',usd:19500,note:'',status:'pending'},
    {id:'s8',title:'Infinix Note 30 · 128GB',cat:'Electronics',key:'electronics',usd:180,note:'',status:'sold'}
  ];

  const REQUESTS=[
    {id:'r1',name:'Achol Deng',item:'iPhone 13 Pro · 256GB',type:'order',time:'2h ago',phone:'+211 92x xxx 110',status:'new'},
    {id:'r2',name:'Peter Garang',item:'Samsung Galaxy A54',type:'order',time:'5h ago',phone:'+211 92x xxx 884',status:'new'},
    {id:'r3',name:'Mary Nyandeng',item:'2-Bed Apartment · Juba Na Bari',type:'contact',time:'1d ago',phone:'+211 95x xxx 201',status:'contacted'},
    {id:'r4',name:'James Lado',item:'Event Decoration Service',type:'quote',time:'2d ago',phone:'+211 91x xxx 552',status:'quoted'},
    {id:'r5',name:'Rebecca Aluel',item:'JBL Bluetooth Speaker',type:'order',time:'3d ago',phone:'+211 92x xxx 037',status:'contacted'}
  ];

  const CONVERSATIONS=[
    {id:'c1',with:'TechHub SS',listingId:1,listingTitle:'iPhone 13 Pro · 256GB · Clean',lastMsg:'Yes, the price is negotiable. When can you pick up?',lastTime:'2h ago',unread:0,verified:true,avInitial:'T'},
    {id:'c2',with:'Nile Motors',listingId:2,listingTitle:'Toyota Land Cruiser V8 (2016)',lastMsg:'Can we meet tomorrow at 10am at the Tongping yard?',lastTime:'5h ago',unread:2,verified:true,avInitial:'N'},
    {id:'c3',with:'Juba Homes',listingId:3,listingTitle:'3-Bedroom House · Thongpiny',lastMsg:'I sent over the rental contract. Let me know.',lastTime:'1d ago',unread:0,verified:true,avInitial:'J'},
    {id:'c4',with:'Lensia Studio',listingId:4,listingTitle:'Wedding & Event Photography',lastMsg:'Looking forward to your wedding next month!',lastTime:'2d ago',unread:0,verified:false,avInitial:'L'},
    {id:'c5',with:'Achol Styles',listingId:5,listingTitle:'Ankara Two-Piece Set · Custom',lastMsg:'I have 3 fabric options I can show you.',lastTime:'3d ago',unread:1,verified:false,avInitial:'A'}
  ];
  const MESSAGES={
    c1:[{from:'them',text:'Hi, is the iPhone still available?',time:'10:14'},{from:'me',text:'Yes, brand new condition. 256GB, battery health 92%.',time:'10:18'},{from:'them',text:'Can we negotiate on the price?',time:'10:22'},{from:'me',text:'A little. Best is $700 if you can pick up today.',time:'10:24'},{from:'them',text:'Yes, the price is negotiable. When can you pick up?',time:'2h ago'}],
    c2:[{from:'them',text:'Hello, interested in the Land Cruiser. Is it negotiable?',time:'Yesterday'},{from:'me',text:'Yes — come for inspection first then we talk price.',time:'Yesterday'},{from:'them',text:'Sounds good. Can we meet tomorrow at 10am at the Tongping yard?',time:'5h ago'}],
    c3:[{from:'me',text:'Hi, sending the rental contract now.',time:'1d ago'},{from:'them',text:'I sent over the rental contract. Let me know.',time:'1d ago'}],
    c4:[{from:'me',text:'Booked you for May 14 wedding.',time:'2d ago'},{from:'them',text:'Looking forward to your wedding next month!',time:'2d ago'}],
    c5:[{from:'them',text:'I have 3 fabric options I can show you.',time:'3d ago'}]
  };
  const NOTIFICATIONS=[
    {id:'no1',type:'request',title:'New order request',body:'Achol Deng wants to order iPhone 13 Pro · 256GB',time:'5m ago',read:false,link:'dashboard.html',icon:'cart'},
    {id:'no2',type:'message',title:'New message',body:'Nile Motors: Can we meet tomorrow at 10am?',time:'2h ago',read:false,link:'messages.html?c=c2',icon:'chat'},
    {id:'no3',type:'system',title:'Verified badge approved',body:'Your shop is now verified — buyers see the green tick everywhere.',time:'1d ago',read:false,link:'dashboard.html',icon:'shield'},
    {id:'no4',type:'boost',title:'Boost ending soon',body:'Your boost on iPhone 13 Pro ends in 2 days.',time:'3d ago',read:true,link:'listing.html?id=1',icon:'bolt'},
    {id:'no5',type:'request',title:'New quote request',body:'Mary Nyandeng requested a quote for Wedding Photography.',time:'5d ago',read:true,link:'dashboard.html',icon:'doc'},
    {id:'no6',type:'system',title:'Welcome to Nile Link!',body:'Your account is set up. Start by listing your first item.',time:'1w ago',read:true,link:'post.html',icon:'spark'}
  ];

  const TESTIMONIALS=[
    {quote:'I sold my Land Cruiser in four days. The buyers who messaged me were serious and the verified badge gave them confidence.',name:'James Wani',role:'Car dealer · Juba',av:'JW',bg:'linear-gradient(135deg,#ea580c,#f59e0b)',stars:5},
    {quote:'Nile Link is where I find tenants now. Posting my rental took two minutes and I had three requests the same evening.',name:'Mary Nyandeng',role:'Landlord · Thongpiny',av:'MN',bg:'linear-gradient(135deg,#0d9488,#10b981)',stars:5},
    {quote:'As a tailor I get custom Ankara orders every week through my shop page. It changed how my small business reaches people.',name:'Achol Deng',role:'Fashion seller · Konyokonyo',av:'AD',bg:'linear-gradient(135deg,#db2777,#f43f6e)',stars:5}
  ];

  const CITIES=['Juba','Wau','Malakal','Yei','Bor','Aweil','Bentiu','Torit','Rumbek','Yambio','Kuajok','Nimule'];

  return {ICONS,CATEGORIES,CATLABEL,typeForCat,groupForCat,LISTINGS,SHOP,REQUESTS,CONVERSATIONS,MESSAGES,NOTIFICATIONS,TESTIMONIALS,CITIES};
})();

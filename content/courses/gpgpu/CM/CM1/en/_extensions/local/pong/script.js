function createNet(sizes, parent, step) {
	var sizes = sizes || [2, 3, 1];
	var step = step || 0.5;
	var net = new Array(sizes.length - 1);
	for (var i = 0; i < net.length; i ++) {
		net[i] = new Array(sizes[i + 1]);
		for (var j = 0; j < net[i].length; j ++) {
			net[i][j] = new Array(sizes[i]);
			for (var k = 0; k < net[i][j].length; k ++) {
				net[i][j][k] = 0.5 + (Math.random() - 0.5) * 0.5;
				if (parent) {
					net[i][j][k] = parent[i][j][k] + (Math.random() - 0.5) * step;
				}
			}
		}
	}
	return net;
}

function runNet(net, input) {
	var output, sum;
	net.forEach((e0, i, a) => {
		output = []; 
		e0.forEach((e1, j, b) => {
			sum = 0;
			e1.forEach((e2, k, c) => {sum += c[k] * input[k]});
			output[j] = (1 / (1 + Math.exp(-sum)));
		});
		input = output;
	});
	return output;
}

var PONG = function(ctx, width, height, callback) {
	this.ctx = ctx;
	this.width = width;
	this.height = height;
	this.maxScore = 20;

	this.racket = {
		w: 15,
		h: 120,
		s: 4,
		x0: 0,
		y0: 0,
		c0: 1,
		b0: 1,
		x1: 0,
		y1: 0,
		c1: 1,
		b1: 1
	};

	this.ball = {
		w: 15,
		h: 15,
		x: 0,
		y: 0,
		a: 1,
		b: 0
	};

	var vx = 1, vy;

	this.restart = function() {
		this.racket.x0 = 0;
		this.racket.y0 = this.height / 2;
		this.racket.x1 = this.width;
		this.racket.y1 = this.height / 2;

		vx = -vx;
		vy = (Math.random() - 0.5);

		this.ball.x = width / 2;
		this.ball.y = height / 2;
		this.ball.a = vx * 5;
		this.ball.b = vy * 5;
	}

	this.clearScore = function() {
		this.racket.c0 = 1;
		this.racket.c1 = 1;
		this.racket.b0 = 1;
		this.racket.b1 = 1;
	}

	this.draw = function() {
		this.ctx.strokeStyle = '#fff';
		this.ctx.strokeRect(0, 0, this.width, this.height);

		this.ctx.fillStyle = '#fff';
		this.ctx.fillRect(
			this.racket.x0,
			this.racket.y0 - this.racket.h / 2,
			this.racket.w,
			this.racket.h
		);

		this.ctx.fillRect(
			this.racket.x1 - this.racket.w,
			this.racket.y1 - this.racket.h / 2,
			this.racket.w,
			this.racket.h
		);

		this.ctx.fillRect(
			this.ball.x - this.ball.w / 2,
			this.ball.y - this.ball.h / 2,
			this.ball.w,
			this.ball.h
		);

		for (var i = 0; i < 17; i += 2) {
			var H = this.height / 17;
			this.ctx.fillRect(
				this.width / 2 - 1, 
				H * i, 
				2, 
				H
			);
		}

		this.ctx.textBaseline = "middle";
		this.ctx.textAlign = "center";
		this.ctx.font = "30pt Arial";
		this.ctx.fillText(
			this.racket.c0 - 1, 
			this.width / 2 - 60, 
			60
		);

		this.ctx.fillText(
			this.racket.c1 - 1, 
			this.width / 2 + 60, 
			60
		);
	}

	this.move = function() {
		this.ball.x += this.ball.a;
		this.ball.y += this.ball.b;

		if (this.ball.x <= 0) {
			this.ball.x = this.racket.w;
			if (this.ball.y >= this.racket.y0 - this.racket.h / 2 &&
				this.ball.y <= this.racket.y0 + this.racket.h / 2) {
				var dy = (this.ball.y - this.racket.y0) * 0.1;
				this.ball.a = -this.ball.a;
				this.ball.b += dy

				this.racket.b0 ++;
			} else {
				this.racket.c1 ++;
				this.restart();
			}
		}

		if (this.ball.x >= this.width) {
			this.ball.x = this.width - this.racket.w;
			if (this.ball.y >= this.racket.y1 - this.racket.h / 2 &&
				this.ball.y <= this.racket.y1 + this.racket.h / 2) {
				var dy = (this.ball.y - this.racket.y1) * 0.1;
				this.ball.a = -this.ball.a;
				this.ball.b += dy

				this.racket.b1 ++;
			} else {
				this.racket.c0 ++;
				this.restart();
			}
		}

		if (this.ball.y < 0 || this.ball.y > this.height) {
			this.ball.b = -this.ball.b;
		}

		if (this.racket.c0 == this.maxScore || 
				this.racket.c1 == this.maxScore) {
			var bestRacket = this.racket.b0 > this.racket.b1,
				bestScore = 0;

			if (bestRacket) {
				bestScore = this.racket.b0;
			} else {
				bestScore = this.racket.b1;
			}

			callback( +bestRacket, bestScore);
			this.clearScore();
			this.restart();
		}
	}

	this.control = function(r, v) {
		if (r) {
			if (!v && this.racket.y1 <= this.height - this.racket.h / 2) {
				this.racket.y1 += this.racket.s;
			}
			if (v && this.racket.y1 >= this.racket.h / 2) {
				this.racket.y1 -= this.racket.s;
			}
		} else {
			if (!v && this.racket.y0 <= this.height - this.racket.h / 2) {
				this.racket.y0 += this.racket.s;
			}
			if (v && this.racket.y0 >= this.racket.h / 2) {
				this.racket.y0 -= this.racket.s;
			}
		}
	}

	this.data = function() {
		var wp = 1 / (this.width / 2),
			hp = 1 / (this.height / 2)

		var x = (this.width / 2 - this.ball.x) * wp,
			y = (this.height / 2 - this.ball.y) * hp;

		var ry0 = (this.height / 2 - this.racket.y0) * hp,
			ry1 = (this.height / 2 - this.racket.y1) * hp

		return [
			[
				ry0, ry1, x, y, this.ball.a / 5, this.ball.b / 2
			],
			[
				ry1, ry0, -x, y, -this.ball.a / 5, this.ball.b / 2
			]
		];
	}

	this.update = function() {
		this.draw();
		this.move();
	}

	this.restart();
}

var net = [[[9.998276651088787,7.160244730972504,-2.1588782263653696,0.6770267908916248,-1.4580714607068939,-11.97180380147072],[0.40135088250336404,-6.80894659409836,-10.468291881275956,1.345591405985676,-0.29906598607266077,-0.750940814249404],[5.263675119725487,-5.202296078260004,3.5541365191673497,-10.083522709167624,0.5520801646369783,0.24892121113495075],[-3.720630184836508,-1.2322452952288026,0.4874715541018364,6.2335923058376395,-9.263120622723793,-3.7560909950488917],[-7.2374386948704315,2.600197762069106,3.9829607968234444,5.782155871416068,4.151190632140103,-0.7705376123111174],[8.537918670131189,1.7960226215118142,-0.2578920392886414,-0.33298112808153835,7.337868054365849,-2.536212303381811],[-1.2038020974293615,1.9870435228669432,0.08870647616088456,-8.56622354296703,-4.695636842467383,-1.0774805496218094],[-2.8869173216745616,3.310391377369596,10.774457238927615,-0.20398049791736964,0.36354198239472557,-0.9033473159714747],[-0.1504027408657763,2.300461647408894,5.560722182212282,-3.440184580514443,-2.169924848036598,-6.703911985858527],[2.952016429111026,-7.410875997818417,3.2960223894786296,-1.280625813634783,-3.970265485139217,2.495153353477366],[0.9967263289443562,3.6222063779073865,2.0129097944317023,-2.0417214087904516,3.2373166634700423,-5.89710876088103],[-5.15727497898702,0.7271682715168547,-0.9105046005033868,5.775765946904055,5.1210550415205445,2.456201850042349]],[[-3.543418013779464,4.114410371856831,-0.9325820726943147,-11.869678384295348,-1.73235033462315,-3.925999058245627,-5.045264736673144,4.911192484524971,-5.3717179894714215,-0.5542074278315261,0.5817677186688021,10.412373895918403],[-5.0654822314807735,0.9468186803991904,-3.038275303377462,3.091961089734691,0.28445140466592783,-10.028430810216683,7.539182062469514,0.5247137778530876,-5.4428172822376295,-1.363834659716768,-2.5029174296081873,2.0118454308442186],[0.9461855620349868,-6.59350574187189,-3.1692462565172583,-2.644408478147363,6.830378647635212,-1.602968979926231,1.4410775552163917,0.07780213290371744,2.128682534728295,-1.2441863202846961,-4.740950933848456,7.562685301315719],[5.377723867304628,-1.2111337036099483,-1.3816977950752918,-3.643129786589757,0.2770867878150446,1.4928148509086334,-3.321147231227915,-5.976142044199278,-5.3377189060223245,-0.6871735643024648,-0.5063323385994565,-4.681268751958136],[3.878846954698342,6.577495906923558,-8.992482650112066,-2.42449713693635,7.867434996569277,1.7018957348756796,3.9624578167100717,1.7274206639245107,-1.1892343712681719,-0.5620023885844744,-8.437791092064014,7.744923583907124],[-11.016352322742256,2.144278126830976,-4.275774126941838,-3.939038807202583,2.919617309638459,5.230701303924917,-2.995561580502725,-5.170794008140637,-2.386784632056647,-0.06229238986314922,2.7623015989805157,-2.9180523814969175],[-5.449645734914125,4.850181388842224,10.187972579319958,3.4011835037836478,-4.975931511666409,4.6173427027518965,6.7703076233844826,-4.886177620518494,1.7208873906397089,-4.357377950997481,-3.99477249330077,-5.324717838069353],[-3.9764123478911317,2.947902178527305,-6.685269529999788,4.179210142274783,4.991159408570307,-2.7267867209129744,-2.4215077206119395,4.103598269944827,4.591464823303247,-4.877777180392991,-2.291603070264121,-0.24419802119901246],[3.4248259959053606,3.0015484390999294,-12.750012141526186,3.6289933757536263,-8.278500533334851,-3.466272797321578,-7.0663546842497995,4.792170506776165,0.0023133055791245694,1.6593579106119374,-2.6087545616308954,-4.143762811776435],[6.521946963650065,6.413316122175562,-7.87127748614108,1.347044552478928,5.436242026993711,-1.5127086012460382,2.6951571334996647,0.5103430718805846,11.977982941714117,-1.5150131097408073,0.6736340336491147,6.164614228878508],[1.1367120009529614,2.8329928966538067,0.595646191745038,-5.76812329312803,1.3101141505263847,-0.5332591312748837,1.737531017593665,-7.393565373207532,-5.235357864117742,-2.3086363355908985,4.058887159356505,-1.7456004278217927],[8.050578471386705,5.601494513018474,3.16720473395309,-4.732646344075828,1.8565213275857582,3.965126465205909,-3.5178809306122836,-5.356470676115486,3.8738650021391576,2.257137029375651,-6.367495798839251,-6.629571520310925]],[[5.882179189641281,7.370955675759753,-1.3237014791539157,-0.5227307717207259,-0.6718603667716889,4.470779726375392,1.1460881596803707,-10.492799128733504,-2.69389232768262,-0.280417304465767,5.437909236554982,0.5678002475500008]]];

var cnv = document.getElementById('cnv');
var ctx = cnv.getContext('2d');

function resizeCanvas() {
  cnv.width = window.innerWidth;
  cnv.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

var width = cnv.width;
var height = cnv.height;
var pong = new PONG(ctx, width, height, function() {});

function LOOP() {
  if (width !== cnv.width || height !== cnv.height) {
    width = cnv.width;
    height = cnv.height;
    pong = new PONG(ctx, width, height, function() {});
  }

  ctx.clearRect(0, 0, width, height);

  pong.update();

  var out0 = runNet(net, pong.data()[0])[0];
  if (out0 >= 0.55) pong.control(0, 0);
  if (out0 <= 0.45) pong.control(0, 1);

  var out1 = runNet(net, pong.data()[1])[0];
  if (out1 >= 0.55) pong.control(1, 0);
  if (out1 <= 0.45) pong.control(1, 1);

  setTimeout(LOOP, 30);
}

LOOP();

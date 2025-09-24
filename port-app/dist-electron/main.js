var h = Object.defineProperty;
var T = (e, t, n) => t in e ? h(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var a = (e, t, n) => T(e, typeof t != "symbol" ? t + "" : t, n);
import { app as i, ipcMain as m, BrowserWindow as p } from "electron";
import c from "path";
import { fileURLToPath as g } from "url";
import { Sequelize as I, DataTypes as o, Model as u, Op as d } from "sequelize";
const v = c.join(i.getPath("userData"), "deport_database.sqlite"), s = new I({
  dialect: "sqlite",
  storage: v,
  logging: console.log
  // Logs SQL queries to the console. Remove for production.
}), N = (e) => {
  e.define("Container", {
    id: {
      type: o.STRING,
      primaryKey: !0,
      allowNull: !1
    },
    location: {
      type: o.STRING,
      allowNull: !0
    },
    entryDate: {
      type: o.DATE,
      allowNull: !1
    },
    status: {
      type: o.STRING,
      allowNull: !1,
      defaultValue: "CLEAN",
      comment: "The condition of the container (e.g., CLEAN, DAMAGED)"
    }
  }, {
    timestamps: !1
  });
}, E = (e) => {
  e.define("Movement", {
    id: {
      type: o.INTEGER,
      primaryKey: !0,
      autoIncrement: !0
    },
    moveType: {
      type: o.STRING,
      allowNull: !1
      // Must be 'IN' or 'OUT'
    },
    timestamp: {
      type: o.DATE,
      defaultValue: o.NOW
    }
  }, {
    timestamps: !1
  });
}, D = (e) => {
  e.define("InspectionPhoto", {
    id: {
      type: o.INTEGER,
      primaryKey: !0,
      autoIncrement: !0
    },
    filePath: {
      type: o.STRING,
      allowNull: !1,
      comment: "The path to the saved image file"
    }
  }, {
    timestamps: !0
  });
};
class r extends u {
  constructor() {
    super(...arguments);
    a(this, "id");
    a(this, "location");
    a(this, "status");
    a(this, "entryDate");
  }
}
class l extends u {
  constructor() {
    super(...arguments);
    a(this, "id");
    a(this, "containerId");
    a(this, "moveType");
    a(this, "timestamp");
  }
}
r.init({}, { sequelize: s, modelName: "Container" });
l.init({}, { sequelize: s, modelName: "Movement" });
async function R() {
  const e = /* @__PURE__ */ new Date();
  e.setHours(0, 0, 0, 0);
  const t = await r.count(), n = await l.count({
    where: { moveType: "IN", timestamp: { [d.gte]: e } }
  }), w = await l.count({
    where: { moveType: "OUT", timestamp: { [d.gte]: e } }
  });
  return { totalContainers: t, entriesToday: n, exitsToday: w };
}
async function M() {
  return await r.findAll({
    order: [["entryDate", "DESC"]]
  });
}
async function _(e) {
  if (e.moveType === "IN") {
    const [t] = await r.upsert({
      id: e.containerId,
      location: e.location,
      status: e.status,
      entryDate: /* @__PURE__ */ new Date()
    });
    await l.create({
      containerId: t.id,
      // Ahora TypeScript sabe que 'container.id' existe
      moveType: "IN"
    });
  } else if (e.moveType === "OUT") {
    const t = await r.findByPk(e.containerId);
    if (t)
      await t.destroy(), await l.create({
        containerId: e.containerId,
        moveType: "OUT"
      });
    else
      throw new Error("Container not found in yard");
  }
  return { success: !0, message: "Movement registered successfully." };
}
const C = g(import.meta.url), y = c.dirname(C), b = process.env.NODE_ENV === "development", S = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173", f = () => {
  const e = new p({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: c.join(y, "preload.js")
    }
  });
  b ? (e.loadURL(S), e.webContents.openDevTools()) : e.loadFile(c.join(y, "../dist/index.html"));
};
async function V() {
  try {
    N(s), E(s), D(s);
    const { Container: e, Movement: t, InspectionPhoto: n } = s.models;
    e.hasMany(t, { foreignKey: "containerId" }), t.belongsTo(e, { foreignKey: "containerId" }), t.hasMany(n, { foreignKey: "movementId" }), n.belongsTo(t, { foreignKey: "movementId" }), await s.sync({ force: !1 }), console.log("Database synced successfully.");
  } catch (e) {
    console.error("Unable to sync database:", e);
  }
}
m.handle("get-dashboard-stats", async () => R());
m.handle("get-containers-in-yard", async () => M());
m.handle("create-movement", async (e, t) => {
  try {
    return await _(t);
  } catch (n) {
    return console.error("Error creating movement:", n), { success: !1, message: n.message };
  }
});
i.whenReady().then(() => {
  V(), f();
});
i.on("window-all-closed", () => {
  process.platform !== "darwin" && i.quit();
});
i.on("activate", () => {
  p.getAllWindows().length === 0 && f();
});

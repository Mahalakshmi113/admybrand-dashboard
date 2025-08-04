"use client";
import { useState, useEffect } from "react";
// @ts-ignore
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ef4444"];

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [revenue, setRevenue] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [conversions, setConversions] = useState(0);
  const [growth, setGrowth] = useState("0%");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [activeUsersData, setActiveUsersData] = useState<any[]>([]);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Chart visibility state
  const [showRevenueChart, setShowRevenueChart] = useState(true);
  const [showConversionChart, setShowConversionChart] = useState(true);
  const [showDeviceChart, setShowDeviceChart] = useState(true);
  const [showActiveUsersChart, setShowActiveUsersChart] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Revenue
      const rRes = await fetch("https://fakestoreapi.com/products");
      const rData = await rRes.json();
      const total = rData.reduce((sum: number, item: any) => sum + item.price, 0);
      setRevenue(total.toFixed(2));

      // Fake revenue history
      const now = new Date();
      const history = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now);
        d.setMonth(now.getMonth() - (5 - i));
        return {
          date: d.toISOString().split("T")[0],
          value: Math.floor(total / 6 + Math.random() * 500),
        };
      });
      setRevenueData(history);

      // Users
      const uRes = await fetch("https://jsonplaceholder.typicode.com/users");
      const uData = await uRes.json();
      const usersWithDates = uData.map((u: any) => ({
        ...u,
        createdAt: new Date(
          now.getTime() - Math.floor(Math.random() * 100) * 24 * 60 * 60 * 1000
        ).toISOString().split("T")[0],
      }));
      setUsers(usersWithDates);

      // Conversions
      const cRes = await fetch("https://jsonplaceholder.typicode.com/todos");
      const cData = await cRes.json();
      const completed = cData.filter((t: any) => t.completed).length;
      setConversions(completed);
      setConversionData([
        { channel: "Email", value: Math.floor(Math.random() * 1000) },
        { channel: "Ads", value: Math.floor(Math.random() * 1200) },
        { channel: "Social", value: Math.floor(Math.random() * 800) },
      ]);

      // Devices
      setUsersData([
        { name: "Desktop", value: Math.floor(Math.random() * 500) },
        { name: "Mobile", value: Math.floor(Math.random() * 400) },
        { name: "Tablet", value: Math.floor(Math.random() * 200) },
      ]);

      // Active vs Inactive Users (fake monthly data)
      const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
      const activeInactive = months.map((m) => ({
        month: m,
        active: Math.floor(Math.random() * 200 + 100),
        inactive: Math.floor(Math.random() * 80 + 20),
      }));
      setActiveUsersData(activeInactive);

      setGrowth(`${Math.floor(Math.random() * 100)}%`);
      setLoading(false);
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Export CSV
  const exportCSV = () => {
    const csv = Papa.unparse(users);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("User Report", 14, 15);
    (doc as any).autoTable({
      head: [["Name", "Email", "Company", "Created At"]],
      body: users.map((u) => [u.name, u.email, u.company?.name || "", u.createdAt]),
    });
    doc.save("users.pdf");
  };

  // Filtering
  let filteredRevenue = revenueData;
  let filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  let filteredActiveUsers = activeUsersData;

  if (startDate && endDate) {
    filteredRevenue = revenueData.filter(
      (d) => d.date >= startDate && d.date <= endDate
    );
    filteredUsers = filteredUsers.filter(
      (u) => u.createdAt >= startDate && u.createdAt <= endDate
    );
    filteredActiveUsers = activeUsersData.filter(
      (d) => d.month >= startDate && d.month <= endDate
    );
  }

  filteredUsers = filteredUsers.sort((a, b) =>
    sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );
  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={`d-flex ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>

      {/* Sidebar */}
      <div
        className={`sidebar p-3 vh-100 d-flex flex-column ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <h4 className="fw-bold mb-4 text-white">📊 ADmyBRAND</h4>

        <h6 className="text-light">📂 Export Data</h6>
        <button className="btn btn-sm btn-light mt-2 w-100" onClick={exportCSV}>⬇ CSV Export</button>
        <button className="btn btn-sm btn-light mt-2 w-100" onClick={exportPDF}>📄 PDF Export</button>

        <h6 className="mt-4 text-light">📅 Filter by Date</h6>
        <input type="date" className="form-control mb-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" className="form-control mb-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button className="btn btn-sm btn-outline-light w-100">Apply Filter</button>

        <h6 className="mt-4 text-light">📊 Toggle Charts</h6>
        <div className="form-check text-light">
          <input className="form-check-input" type="checkbox" checked={showRevenueChart} onChange={() => setShowRevenueChart(!showRevenueChart)} />
          <label className="form-check-label">Revenue Growth</label>
        </div>
        <div className="form-check text-light">
          <input className="form-check-input" type="checkbox" checked={showConversionChart} onChange={() => setShowConversionChart(!showConversionChart)} />
          <label className="form-check-label">Conversions</label>
        </div>
        <div className="form-check text-light">
          <input className="form-check-input" type="checkbox" checked={showDeviceChart} onChange={() => setShowDeviceChart(!showDeviceChart)} />
          <label className="form-check-label">Users by Device</label>
        </div>
        <div className="form-check text-light">
          <input className="form-check-input" type="checkbox" checked={showActiveUsersChart} onChange={() => setShowActiveUsersChart(!showActiveUsersChart)} />
          <label className="form-check-label">Monthly Active Users</label>
        </div>
      </div>

      {/* Overlay (mobile) */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <div className="container-fluid p-4 flex-grow-1" style={{ marginLeft: "260px" }}>
        {/* Top bar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-outline-secondary d-md-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="bi bi-list"></i>
            </button>
            <h3 className="fw-bold">Dashboard Overview</h3>
          </div>
          <button className="btn btn-sm btn-warning shadow" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="row g-3">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="col-md-3">
                <div className="card p-3 shadow-lg placeholder-glow kpi-card" style={{ height: "100px" }}>
                  <span className="placeholder col-6 mb-2"></span>
                  <span className="placeholder col-4"></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="row g-3 fade-in">
            {[
              { title: "Revenue", value: `$${revenue}`, icon: "bi-currency-dollar", gradient: "bg-gradient-primary" },
              { title: "Users", value: users.length, icon: "bi-people", gradient: "bg-gradient-info" },
              { title: "Conversions", value: conversions, icon: "bi-check2-circle", gradient: "bg-gradient-danger" },
              { title: "Growth", value: growth, icon: "bi-graph-up-arrow", gradient: "bg-gradient-success" },
            ].map((card, i) => (
              <div className="col-md-3" key={i}>
                <div className={`card text-white p-3 shadow-lg kpi-card ${card.gradient}`}>
                  <div className="d-flex align-items-center">
                    <i className={`bi ${card.icon} fs-2 me-3`}></i>
                    <div>
                      <h6>{card.title}</h6>
                      <h3>{card.value}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        <div className="row mt-4 g-3">
          {loading ? (
            [1, 2, 3, 4].map((s) => (
              <div key={s} className="col-md-6">
                <div className="card p-3 shadow-lg placeholder-glow chart-card" style={{ height: "300px" }}>
                  <span className="placeholder col-6 mb-2"></span>
                  <div className="bg-secondary rounded w-100 h-100"></div>
                </div>
              </div>
            ))
          ) : (
            <div className="fade-in row g-3">
              {showRevenueChart && (
                <div className="col-md-6">
                  <div className="card p-3 shadow-lg chart-card">
                    <h6>Revenue Growth</h6>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={filteredRevenue}>
                        <CartesianGrid stroke="#444" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {showConversionChart && (
                <div className="col-md-6">
                  <div className="card p-3 shadow-lg chart-card">
                    <h6>Conversions by Channel</h6>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={conversionData}>
                        <CartesianGrid stroke="#444" />
                        <XAxis dataKey="channel" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#22c55e" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {showDeviceChart && (
                <div className="col-md-6">
                  <div className="card p-3 shadow-lg chart-card">
                    <h6>Users by Device</h6>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={usersData} dataKey="value" nameKey="name" outerRadius={80} label>
                          {usersData.map((entry, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {showActiveUsersChart && (
                <div className="col-md-6">
                  <div className="card p-3 shadow-lg chart-card">
                    <h6>Monthly Active Users</h6>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={filteredActiveUsers}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="active" stackId="1" stroke="#22c55e" fill="#22c55e" />
                        <Area type="monotone" dataKey="inactive" stackId="1" stroke="#ef4444" fill="#ef4444" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Table */}
        <div className="card p-3 mt-4 shadow-lg">
          <h6>User Data</h6>
          <input
            type="text"
            placeholder="Search users..."
            className="form-control my-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loading ? (
            <table className="table">
              <thead className="table-dark">
                <tr>
                  <th>Name</th><th>Email</th><th>Company</th><th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((r) => (
                  <tr key={r}>
                    <td><span className="placeholder col-8"></span></td>
                    <td><span className="placeholder col-6"></span></td>
                    <td><span className="placeholder col-5"></span></td>
                    <td><span className="placeholder col-4"></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="fade-in">
              <table className="table table-hover table-striped align-middle">
                <thead className="table-dark sticky-top">
                  <tr>
                    <th onClick={() => setSortAsc(!sortAsc)} style={{ cursor: "pointer" }}>
                      Name {sortAsc ? "▲" : "▼"}
                    </th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <img src={`https://i.pravatar.cc/40?u=${u.id}`} className="rounded-circle me-2" alt="avatar" />
                        {u.name}
                      </td>
                      <td>{u.email}</td>
                      <td>{u.company?.name}</td>
                      <td>{u.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="d-flex justify-content-between align-items-center">
                <button disabled={page === 1} className="btn btn-sm btn-outline-secondary" onClick={() => setPage(page - 1)}>Prev</button>
                <span>Page {page}</span>
                <button disabled={page * pageSize >= filteredUsers.length} className="btn btn-sm btn-outline-secondary" onClick={() => setPage(page + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


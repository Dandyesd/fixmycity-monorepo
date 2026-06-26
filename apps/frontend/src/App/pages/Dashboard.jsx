import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  MoreHorizontal,
  Edit,
  ChevronDown,
  Plus,
  FileText,
  Loader2,
  X,
  Trash2, // Impor ikon untuk delete
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator, // Separator untuk memisahkan menu
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/Textarea";
import { useAuth } from "../../contexts/AuthContexts";

function SocialDashboard() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingReportId, setEditingReportId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: "", description: "", location: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = ["Pending", "On Progress", "Fixed"];
  const statusColors = {
    Pending: "destructive",
    "On Progress": "secondary",
    Fixed: "default",
  };

  const handleEditClick = (report) => {
    setEditingReportId(report.id);
    setEditFormData({
      title: report.title,
      description: report.description,
      location: report.location,
    });
  };

  const handleCancelEdit = () => {
    setEditingReportId(null);
    setEditFormData({ title: "", description: "", location: "" });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateReport = async () => {
    if (!editingReportId) return;
    setIsUpdating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/report/${editingReportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedReport = await response.json();
        setReports((currentReports) =>
          currentReports.map((report) =>
            report.id === editingReportId ? { ...report, ...updatedReport } : report
          )
        );
        handleCancelEdit();
      } else {
        const errorData = await response.json();
        console.error("Failed to update report:", errorData);
        alert("Gagal memperbarui laporan. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- FUNGSI BARU UNTUK HAPUS LAPORAN ---
  const handleDeleteReport = async (reportId) => {
    // Tampilkan dialog konfirmasi sebelum menghapus
    if (!window.confirm("Are you sure you want to permanently delete this report?")) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/report/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        // Hapus laporan dari state UI untuk memberikan feedback langsung
        setReports((currentReports) =>
          currentReports.filter((report) => report.id !== reportId)
        );
        alert("Laporan berhasil dihapus.");
      } else {
        const errorData = await response.json();
        console.error("Failed to delete report:", errorData);
        alert("Gagal menghapus laporan. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Terjadi kesalahan koneksi. Silakan coba lagi.");
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    let backendStatus;
    if (newStatus === "On Progress") backendStatus = "DIPROSES";
    else if (newStatus === "Fixed") backendStatus = "SELESAI";
    else backendStatus = "PENDING";
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/report/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: backendStatus }),
      });
      
      if(response.ok) {
        const updatedReportFromServer = await response.json();
        setReports((currentReports) =>
          currentReports.map((report) => {
            if (report.id === reportId) {
              // Konversi status dari backend ke format frontend
              const frontendStatus = updatedReportFromServer.status === 'DIPROSES' ? 'On Progress' : (updatedReportFromServer.status === 'SELESAI' ? 'Fixed' : 'Pending');
              return { ...report, status: frontendStatus };
            }
            return report;
          })
        );
      } else {
         const errorData = await response.json();
         console.error("Failed to update status:", errorData);
         alert("Gagal memperbarui status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Terjadi kesalahan saat memperbarui status.");
    }
  };

  const handleCreateReport = () => {
    navigate("/laporan");
  };

  const fetchUserReports = async () => {
    if (!isLoggedIn || !user?.id_user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/report/user/${user.id_user}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const formattedData = data.data.map(report => ({
            ...report,
            status: report.status === 'DIPROSES' ? 'On Progress' : (report.status === 'SELESAI' ? 'Fixed' : 'Pending')
          }));
          setReports(formattedData);
        } else {
          setReports([]);
        }
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReports();
  }, [user, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-screen-xl mx-auto bg-[#F7FBFA] pb-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your dashboard</h2>
          <a href="/login" className="px-6 py-3 bg-[#16423c] text-white rounded-lg hover:bg-[#6a9c89] transition-colors">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto bg-[#F7FBFA] pb-6 min-h-screen">
      <div className="bg-[#16423c] text-white p-5 border-b shadow-sm rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 font-header">
            <Avatar className="h-20 w-20 border-2 border-white">
                <AvatarImage src={user?.user_profile} alt={user?.user_name} />
                <AvatarFallback>{user?.user_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user?.user_name || "Unknown User"}</h2>
              <p className="text-sm mt-1 opacity-90">{user?.user_email || ""}</p>
              <p className="text-sm mt-1 capitalize">Role: {user?.role?.role_name || "User"}</p>
            </div>
          </div>
          <Button onClick={handleCreateReport} className="bg-white text-[#16423c] hover:bg-gray-100 font-semibold px-6 py-2 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      <div className="mt-6 px-4 lg:px-2 font-body">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Reports</h3>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#6a9c89] mx-auto" />
            <p className="text-gray-600 mt-2">Loading your reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md p-6">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-700 mb-2">No reports found</h4>
            <Button onClick={handleCreateReport} className="bg-[#6a9c89] text-white hover:bg-[#5a8c79] font-semibold px-6 py-2 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Submit Your First Report
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="px-4 pt-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10 border">
                         <AvatarImage src={report.user?.user_profile} alt={report.user?.user_name} />
                         <AvatarFallback>{report.user?.user_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{report.user?.user_name}</p>
                        <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                       {user?.role?.role_name === "admin" ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge variant={statusColors[report.status]} className="capitalize cursor-pointer py-1 px-2 text-xs hover:opacity-80 transition-opacity">
                                {report.status} <ChevronDown className="h-3 w-3 ml-1 inline-block" />
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {statusOptions.map((statusOption) => (
                                <DropdownMenuItem key={statusOption} onClick={() => handleStatusChange(report.id, statusOption)} className={`text-xs ${report.status === statusOption ? "bg-gray-100" : ""}`}>
                                  <Check className={`h-3 w-3 mr-2 ${report.status === statusOption ? "opacity-100" : "opacity-0"}`} />
                                  {statusOption}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge variant={statusColors[report.status]} className="capitalize py-1 px-2 text-xs">{report.status}</Badge>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(report)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {/* --- TOMBOL DELETE BARU --- */}
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteReport(report.id)}
                                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-1 flex-grow">
                  {editingReportId === report.id ? (
                    <div className="flex flex-col gap-4 py-2">
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Title</label>
                            <Input name="title" value={editFormData.title} onChange={handleFormChange} className="mt-1"/>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Description</label>
                            <Textarea name="description" value={editFormData.description} onChange={handleFormChange} className="mt-1" rows={4}/>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Location</label>
                            <Input name="location" value={editFormData.location} onChange={handleFormChange} className="mt-1"/>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                            <Button onClick={handleUpdateReport} disabled={isUpdating}>
                                {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{report.title}</h4>
                      <p className="text-sm mb-1 text-gray-700 leading-relaxed break-words">{report.description}</p>
                      <p className="text-xs text-gray-500 mb-3">📍 {report.location}</p>
                      {report.imageUrl && (
                        <div className="rounded-md overflow-hidden mb-3 border">
                          <img src={report.imageUrl} alt="Report content" className="w-full object-cover max-h-72" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SocialDashboard;
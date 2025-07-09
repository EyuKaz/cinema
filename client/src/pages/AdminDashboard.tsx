import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, Edit2, Trash2, Download, Eye, Building, Users, DollarSign, Activity } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const cinemaSchema = z.object({
  name: z.string().min(1, "Cinema name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  phone: z.string().optional(),
  description: z.string().optional(),
  ownerId: z.string().min(1, "Owner is required"),
});

const commissionSchema = z.object({
  cinemaId: z.number(),
  rate: z.number().min(0).max(1, "Rate must be between 0 and 1"),
});

type CinemaFormData = z.infer<typeof cinemaSchema>;
type CommissionFormData = z.infer<typeof commissionSchema>;

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCinema, setSelectedCinema] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Unauthorized",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Queries
  const { data: cinemas = [], isLoading: cinemasLoading } = useQuery({
    queryKey: ["/api/admin/cinemas"],
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/admin/transactions"],
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ["/api/admin/audit-logs"],
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  // Forms
  const cinemaForm = useForm<CinemaFormData>({
    resolver: zodResolver(cinemaSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      description: "",
      ownerId: "",
    },
  });

  const commissionForm = useForm<CommissionFormData>({
    resolver: zodResolver(commissionSchema),
    defaultValues: {
      cinemaId: 0,
      rate: 0.1,
    },
  });

  // Mutations
  const createCinemaMutation = useMutation({
    mutationFn: async (data: CinemaFormData) => {
      return await apiRequest("/api/admin/cinemas", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cinemas"] });
      toast({
        title: "Success",
        description: "Cinema created successfully",
      });
      setIsEditModalOpen(false);
      cinemaForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create cinema",
        variant: "destructive",
      });
    },
  });

  const updateCinemaMutation = useMutation({
    mutationFn: async (data: CinemaFormData & { id: number }) => {
      return await apiRequest(`/api/admin/cinemas/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cinemas"] });
      toast({
        title: "Success",
        description: "Cinema updated successfully",
      });
      setIsEditModalOpen(false);
      setSelectedCinema(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update cinema",
        variant: "destructive",
      });
    },
  });

  const deleteCinemaMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/cinemas/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cinemas"] });
      toast({
        title: "Success",
        description: "Cinema deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete cinema",
        variant: "destructive",
      });
    },
  });

  const updateCommissionMutation = useMutation({
    mutationFn: async (data: CommissionFormData) => {
      return await apiRequest("/api/admin/commission", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Commission rate updated successfully",
      });
      setIsCommissionModalOpen(false);
      commissionForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update commission rate",
        variant: "destructive",
      });
    },
  });

  const handleEditCinema = (cinema: any) => {
    setSelectedCinema(cinema);
    cinemaForm.reset({
      name: cinema.name,
      address: cinema.address,
      city: cinema.city,
      state: cinema.state,
      zipCode: cinema.zipCode,
      phone: cinema.phone || "",
      description: cinema.description || "",
      ownerId: cinema.ownerId,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteCinema = async (id: number) => {
    if (confirm("Are you sure you want to delete this cinema?")) {
      deleteCinemaMutation.mutate(id);
    }
  };

  const onCinemaSubmit = (data: CinemaFormData) => {
    if (selectedCinema) {
      updateCinemaMutation.mutate({ ...data, id: selectedCinema.id });
    } else {
      createCinemaMutation.mutate(data);
    }
  };

  const onCommissionSubmit = (data: CommissionFormData) => {
    updateCommissionMutation.mutate(data);
  };

  const exportTransactions = () => {
    // Convert transactions to CSV
    const csvData = transactions.map((t: any) => ({
      "Booking ID": t.bookingId,
      "Reference": t.bookingReference,
      "Movie": t.movieTitle,
      "Cinema": t.cinemaName,
      "Amount": t.amount,
      "Date": new Date(t.createdAt).toLocaleDateString(),
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <Badge variant="secondary" className="bg-purple-600 text-white">
              Administrator
            </Badge>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/10 border-white/20">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cinemas">Cinemas</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/10 border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Total Cinemas</CardTitle>
                    <Building className="h-4 w-4 text-purple-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{cinemas.length}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-purple-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{users.length}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-purple-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      ${transactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Total Bookings</CardTitle>
                    <Activity className="h-4 w-4 text-purple-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{transactions.length}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cinemas" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Cinema Management</h2>
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Cinema
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        {selectedCinema ? "Edit Cinema" : "Add New Cinema"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={cinemaForm.handleSubmit(onCinemaSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Name</Label>
                        <Input
                          id="name"
                          {...cinemaForm.register("name")}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Cinema name"
                        />
                        {cinemaForm.formState.errors.name && (
                          <p className="text-red-400 text-sm">{cinemaForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-white">Address</Label>
                        <Input
                          id="address"
                          {...cinemaForm.register("address")}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Street address"
                        />
                        {cinemaForm.formState.errors.address && (
                          <p className="text-red-400 text-sm">{cinemaForm.formState.errors.address.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-white">City</Label>
                          <Input
                            id="city"
                            {...cinemaForm.register("city")}
                            className="bg-gray-800 border-gray-600 text-white"
                            placeholder="City"
                          />
                          {cinemaForm.formState.errors.city && (
                            <p className="text-red-400 text-sm">{cinemaForm.formState.errors.city.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-white">State</Label>
                          <Input
                            id="state"
                            {...cinemaForm.register("state")}
                            className="bg-gray-800 border-gray-600 text-white"
                            placeholder="State"
                          />
                          {cinemaForm.formState.errors.state && (
                            <p className="text-red-400 text-sm">{cinemaForm.formState.errors.state.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="zipCode" className="text-white">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            {...cinemaForm.register("zipCode")}
                            className="bg-gray-800 border-gray-600 text-white"
                            placeholder="ZIP code"
                          />
                          {cinemaForm.formState.errors.zipCode && (
                            <p className="text-red-400 text-sm">{cinemaForm.formState.errors.zipCode.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-white">Phone</Label>
                          <Input
                            id="phone"
                            {...cinemaForm.register("phone")}
                            className="bg-gray-800 border-gray-600 text-white"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerId" className="text-white">Owner</Label>
                        <Select
                          value={cinemaForm.watch("ownerId")}
                          onValueChange={(value) => cinemaForm.setValue("ownerId", value)}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.filter((u: any) => u.role === "cinema_owner").map((owner: any) => (
                              <SelectItem key={owner.id} value={owner.id}>
                                {owner.firstName} {owner.lastName} ({owner.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {cinemaForm.formState.errors.ownerId && (
                          <p className="text-red-400 text-sm">{cinemaForm.formState.errors.ownerId.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-white">Description</Label>
                        <Textarea
                          id="description"
                          {...cinemaForm.register("description")}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Cinema description"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={createCinemaMutation.isPending || updateCinemaMutation.isPending}
                        >
                          {selectedCinema ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">Name</TableHead>
                        <TableHead className="text-white">Location</TableHead>
                        <TableHead className="text-white">Owner</TableHead>
                        <TableHead className="text-white">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cinemas.map((cinema: any) => (
                        <TableRow key={cinema.id}>
                          <TableCell className="text-white">{cinema.name}</TableCell>
                          <TableCell className="text-white">{cinema.city}, {cinema.state}</TableCell>
                          <TableCell className="text-white">{cinema.ownerName || "N/A"}</TableCell>
                          <TableCell className="space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCinema(cinema)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCinema(cinema.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Transaction Overview</h2>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={exportTransactions}
                    className="border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Dialog open={isCommissionModalOpen} onOpenChange={setIsCommissionModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Set Commission
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Set Commission Rate</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={commissionForm.handleSubmit(onCommissionSubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cinemaId" className="text-white">Cinema</Label>
                          <Select
                            value={commissionForm.watch("cinemaId")?.toString()}
                            onValueChange={(value) => commissionForm.setValue("cinemaId", parseInt(value))}
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Select cinema" />
                            </SelectTrigger>
                            <SelectContent>
                              {cinemas.map((cinema: any) => (
                                <SelectItem key={cinema.id} value={cinema.id.toString()}>
                                  {cinema.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rate" className="text-white">Commission Rate (%)</Label>
                          <Input
                            id="rate"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            {...commissionForm.register("rate", { valueAsNumber: true })}
                            className="bg-gray-800 border-gray-600 text-white"
                            placeholder="10.00"
                            onChange={(e) => commissionForm.setValue("rate", parseFloat(e.target.value) / 100)}
                          />
                          {commissionForm.formState.errors.rate && (
                            <p className="text-red-400 text-sm">{commissionForm.formState.errors.rate.message}</p>
                          )}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsCommissionModalOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={updateCommissionMutation.isPending}
                          >
                            Update
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">Booking ID</TableHead>
                        <TableHead className="text-white">Movie</TableHead>
                        <TableHead className="text-white">Cinema</TableHead>
                        <TableHead className="text-white">Amount</TableHead>
                        <TableHead className="text-white">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction: any) => (
                        <TableRow key={transaction.bookingId}>
                          <TableCell className="text-white">{transaction.bookingReference}</TableCell>
                          <TableCell className="text-white">{transaction.movieTitle}</TableCell>
                          <TableCell className="text-white">{transaction.cinemaName}</TableCell>
                          <TableCell className="text-white">${transaction.amount}</TableCell>
                          <TableCell className="text-white">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">Name</TableHead>
                        <TableHead className="text-white">Email</TableHead>
                        <TableHead className="text-white">Role</TableHead>
                        <TableHead className="text-white">Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="text-white">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell className="text-white">{user.email}</TableCell>
                          <TableCell className="text-white">
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Audit Trail</h2>
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-white">Admin</TableHead>
                        <TableHead className="text-white">Action</TableHead>
                        <TableHead className="text-white">Details</TableHead>
                        <TableHead className="text-white">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-white">{log.adminName}</TableCell>
                          <TableCell className="text-white">{log.action}</TableCell>
                          <TableCell className="text-white">{log.details}</TableCell>
                          <TableCell className="text-white">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
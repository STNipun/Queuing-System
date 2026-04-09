import { Calendar, Clock, User, Phone, UserCog, Hash } from "lucide-react";

type AppointmentDetailsViewProps = {
    appointment: {
        id: string;
        queueNumber: number;
        appointmentDate: Date | string;
        appointmentTime: string;
        status: string;
        createdAt: Date | string;
        doctor: {
            first_name: string;
            last_name: string;
        };
        patient: {
            name: string;
            age: number;
            mobile: string;
        };
    };
};

export function AppointmentDetailsView({ appointment }: AppointmentDetailsViewProps)
{
    const formatDate = (date: Date | string) =>
    {
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    };

    const formatDateTime = (date: Date | string) =>
    {
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusColor = (status: string) =>
    {
        switch (status)
        {
            case "scheduled":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
            case "completed":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
            case "cancelled":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
        }
    };

    return (
        <div className="space-y-6">
            {/* Queue Number - Large and Prominent */}
            <div className="flex items-center justify-center py-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        <Hash className="h-4 w-4" />
                        Queue Number
                    </div>
                    <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                        {appointment.queueNumber}
                    </div>
                </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                </span>
            </div>

            {/* Patient Information */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Patient Information
                </h3>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Name</div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {appointment.patient.name}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Age</div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {appointment.patient.age} years
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Mobile</div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {appointment.patient.mobile}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Appointment Details
                </h3>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <UserCog className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Doctor</div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Date</div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {formatDate(appointment.appointmentDate)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Time</div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {appointment.appointmentTime}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    Created on {formatDateTime(appointment.createdAt)}
                </div>
            </div>
        </div>
    );
}

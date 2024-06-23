import {Card, CardContent} from "./ui/card";

const NextAppointments = () => {
  const nextAppointments = [
    {
      name: "John Doe",
      appointmentDate: "2023-06-25, 10AM",
      reason: "Routine Check-up",
    },
    {
      name: "Jane Smith",
      appointmentDate: "2023-07-01, 2:30PM",
      reason: "Follow-up Appointment",
    },
    {
      name: "Michael Johnson",
      appointmentDate: "2023-07-15, 9AM",
      reason: "Flu Shot",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Next Appointments</h2>
        <Card className="mt-4">
          <CardContent className="space-y-4 p-6">
            {nextAppointments.map((appointment) => (
              <div key={appointment.name}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{appointment.name}</div>
                  <div className="text-muted-foreground">{appointment.appointmentDate}</div>
                </div>
                <div className="text-muted-foreground">{appointment.reason}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NextAppointments;

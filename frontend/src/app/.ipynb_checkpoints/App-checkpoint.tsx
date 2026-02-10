import Navbar from "../components/Navbar";
import PatientList from "../modules/patients/PatientList";

export default function App() {
  return (
    <>
      <Navbar />
      <div style={{ padding: 24 }}>
        <PatientList />
      </div>
    </>
  );
}

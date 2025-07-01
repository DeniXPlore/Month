import { useEffect, useState } from "react";

interface Value {
  income: number | null;
  activePartners: number | null;
}

interface MonthData {
  plan: Value | null;
  fact: Value | null;
}

interface Manager {
  id: number;
  adminId: number;
  adminName: string;
  year: number;
  months: (MonthData | null)[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const App: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [total, setTotal] = useState<MonthData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [year, setYear] = useState("2025");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://3snet.co/js_test/api.json");
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        setManagers(result.data.table || []);
        setTotal(
          (result.data.total || []).filter(
            (data: MonthData | null): data is MonthData => data !== null
          )
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + 12) % 12);
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % 12);
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setYear(e.target.value);

  const getCyclicIndex = (index: number) => index % 12;

  const visibleMonths = Array.from(
    { length: 6 },
    (_, i) => MONTH_NAMES[(currentIndex + i) % 12]
  );

  const format = (value: number | null | undefined) =>
    value != null && !isNaN(value) ? `$${value.toLocaleString()}` : "";

  const formatNum = (value: number | null | undefined) =>
    value != null && !isNaN(value) ? value : "";

  const isEmptyMonth = (data: MonthData | null | undefined): boolean => {
    if (!data) return true;
    const { plan, fact } = data;
    return (
      !plan?.income &&
      !plan?.activePartners &&
      !fact?.income &&
      !fact?.activePartners
    );
  };

  return (
    <div className="w-[1440px] h-[1080px] mx-auto p-4 bg-gray-50 overflow-auto">

      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <select
            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full z-10"
            value={year}
            onChange={handleYearChange}
          >
            <option value="2025">Year 2025</option>
            <option value="2024">Year 2024</option>
          </select>
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400  text-xs pointer-events-none z-20">
            ▼
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-300 transition-colors"
          >
            {"<"}
          </button>
          <button
            onClick={handleNext}
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-300 transition-colors"
          >
            {">"}
          </button>
          <button className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            + Add plan
          </button>
        </div>
      </div>

      <table className="w-full border-collapse text-sm bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-blue-50">
            <th className="border-b border-r border-gray-300 px-6 py-3"></th>
            <th className="border-b border-r border-gray-300"></th>
            {visibleMonths.map((month, idx) => (
              <th
                key={idx}
                className={`border-b border-gray-200 px-3 py-2 text-left text-gray-300 font-semibold ${
                  idx !== visibleMonths.length - 1 ? "border-r" : ""
                }`}
                style={{ minWidth: "140px" }}
              >
                <div className="flex flex-col items-start">
                  <span>{month}</span>
                  <div className="grid grid-cols-2 gap-4 w-full text-xs text-gray-300">
                    <span className="text-left">Plan</span>
                    <span className="text-left">Fact</span>
                  </div>
                </div>
              </th>
            ))}
          </tr>
          <tr className="bg-white">
            <th
              className="border-b border-r border-gray-300 px-6 py-3 text-left font-semibold"
              rowSpan={2}
            >
              Manager
            </th>
            <th className="border-b border-r border-gray-300">
              <div className="flex flex-col justify-center items-start w-full h-full text-gray-700 font-semibold">
                <span className="my-1 mx-5">Total Income:</span>
                <div className="w-full h-px bg-gray-300"></div>
                <span className="my-1 mx-5">Total Active Partners:</span>
              </div>
            </th>
            {visibleMonths.map((_, idx) => {
              const data = total[getCyclicIndex(currentIndex + idx)];
              return (
                <th
                  key={idx}
                  className={`border-b border-gray-200 px-3 py-2 text-xs text-gray-300 text-left ${
                    idx !== visibleMonths.length - 1 ? "border-r" : ""
                  }`}
                  style={{ height: "60px" }}
                >
                  <div className="h-full flex flex-col items-start justify-center gap-0.5 w-full">
                    {isEmptyMonth(data) ? (
                      <span className="text-gray-400">No data</span>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4 w-full text-left">
                          <span>{format(data?.plan?.income)}</span>
                          <span>{format(data?.fact?.income)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full text-left">
                          <span>{formatNum(data?.plan?.activePartners)}</span>
                          <span>{formatNum(data?.fact?.activePartners)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {managers.map((manager) => (
            <tr key={manager.id} className="hover:bg-gray-50 transition-colors">
              <td className="border-b border-r border-gray-300 px-6 py-3 font-bold text-gray-800">
                {manager.adminName}
              </td>
              <td className="border-b border-r border-gray-300 ">
                <div className="flex flex-col justify-center text-start w-full h-full text-gray-300">
                  <span className="mx-5">Income:</span>
                  <div className="w-full h-px bg-gray-300 my-1" />
                  <span className="mx-5">Active partners:</span>
                </div>
              </td>

              {visibleMonths.map((_, idx) => {
                const dataIndex = getCyclicIndex(currentIndex + idx);
                const monthData = manager.months[dataIndex];
                return (
                  <td
                    key={idx}
                    className={`border-b border-gray-200 px-3 py-2 text-xs text-gray-300 text-left ${
                      idx !== visibleMonths.length - 1 ? "border-r" : ""
                    }`}
                    style={{ height: "60px" }}
                  >
                    <div className="h-full flex flex-col items-start justify-center gap-0.5 w-full">
                      {isEmptyMonth(monthData) ? (
                        <span className="text-gray-300">No data</span>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-4 w-full text-left">
                            <span>{format(monthData?.plan?.income)}</span>
                            <span>{format(monthData?.fact?.income)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 w-full text-left">
                            <span>
                              {formatNum(monthData?.plan?.activePartners)}
                            </span>
                            <span>
                              {formatNum(monthData?.fact?.activePartners)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;

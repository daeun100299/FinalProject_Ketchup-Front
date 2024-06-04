import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../../components/contents/SearchBar";
import ButtonGroup from "../../components/contents/ButtonGroup";
import BootstrapTable from "../../components/contents/BootstrapTable";
import { callGetBoardListAPI } from "../../apis/BoardAPICalls";
import PaginationButtons from "../../components/contents/PaginationButtons";
import { decodeJwt } from "../../utils/tokenUtils";
import { callDepartmentsAPI } from "../../apis/MemberAPICalls";
import FormatDateTime from "../../components/contents/FormatDateTime";
import { Box, Typography } from "@mui/material";

function Boards() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const result = useSelector(state => state.boardReducer);
    const boardList = result.boardlist || [];
    const departments = useSelector(state => state.departmentReducer) || [];

    const [totalItems, setTotalItems] = useState(0);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(true);

    const loginToken = decodeJwt(window.localStorage.getItem("accessToken"));
    const userRole = loginToken.role;
    const depNo = loginToken.depNo;
    const depName = loginToken.depName;

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await dispatch(callDepartmentsAPI());
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };
        fetchDepartments();
    }, [dispatch]);

    useEffect(() => {
        const fetchBoardList = async () => {
            try {
                let departmentNoToFetch = selectedDepartment || depNo; 
                if (userRole === 'LV3') { 
                    departmentNoToFetch = selectedDepartment || depNo;
                }
                setLoading(true);
                const response = await dispatch(callGetBoardListAPI({
                    depNo: departmentNoToFetch,
                    title: typeof searchKeyword === 'string' ? searchKeyword.toLowerCase() : '',
                    currentPage: currentPage,
                    setTotalItems: setTotalItems
                })).finally(() => setLoading(false));

            } catch (error) {
                console.error("Error fetching board list:", error);
            }
        };
        fetchBoardList();
    }, [dispatch, depNo, selectedDepartment, searchKeyword, currentPage]);

    const columns = [
        ['boardNo', '번호'],
        ['boardTitle', '제목'],
        ['memberName', '작성자'],
        ['boardCreateDttm', '등록일']
    ];

    const formattedBoardList = boardList.map(board => ({
        ...board,
        memberName: `${board.memberName} ${board.positionName}`,
        boardCreateDttm: FormatDateTime(board.boardCreateDttm)
    }));

    const handleRowClick = (index) => {
        const selectedBoard = boardList[index];
        navigate(`/boards/${selectedBoard.boardNo}`);
    };

    const handleSearch = (searchKeyword) => {
        setCurrentPage(1);
        setSearchKeyword(searchKeyword);
    };

    const handleDepartmentChange = (event) => {
        setSelectedDepartment(Number(event.target.value));
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <main id="main" className="main">
            <div className="title">
                <h2>자료실</h2>
                {userRole === 'LV3' ? (
                    <div>
                        <select style={{ border: "none", padding: 10 }} onChange={handleDepartmentChange} value={selectedDepartment}>
                            <option value="">부서 선택</option>
                            {departments.length > 0 && departments.map(department => (
                                <option key={department.depNo} value={department.depNo}>{department.depName}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <ul style={{ margin: 0, padding: 0 }}>
                        <li style={{ listStyle: 'none' }}>{depName}</li>
                    </ul>

                )}
                <SearchBar onSearch={handleSearch} value={searchKeyword} name={'제목 검색'} />
            </div>

            <div className="col-lg-12">
                <div className="row"></div>
                <div className="list">
                    <Link to="/boards/insert">
                        <ButtonGroup buttons={[{ label: '등록', styleClass: 'move' }]} />
                    </Link>

                    {formattedBoardList.length === 0 && (
                        <>
                            <BootstrapTable data={formattedBoardList} columns={columns} onRowClick={handleRowClick} />
                            {/* <p style={{ textAlign: 'center' }}>{searchKeyword} 게시물이 없습니다.</p> */}
                            <Box height={'480px'} display="flex" flexDirection="column" justifyContent="center" alignItems="center" margin={'auto'}>
                                <Typography fontSize={24} textAlign={'center'}>{searchKeyword} 게시물이 없습니다.</Typography>
                                <img src="/img/searchConditionRequired.png" alt="searchConditionRequired" style={{ display: "block", margin: "0 auto", maxWidth: "100%", height: "auto" }} />
                            </Box>
                        </>
                    )}

                    {formattedBoardList.length > 0 && (
                        <BootstrapTable data={formattedBoardList} columns={columns} onRowClick={handleRowClick} />
                    )}
                    <PaginationButtons totalItems={totalItems} itemsPerPage={10} currentPage={currentPage} onPageChange={(pageNumber) => setCurrentPage(pageNumber)} />
                </div>
            </div>
        </main>
    );
}

export default Boards;

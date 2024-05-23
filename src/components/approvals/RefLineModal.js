import AppModalCss from './AppModal.module.css';
import Style from "./AppLine.module.css";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { callMembersAPI } from '../../apis/MemberAPICalls';
import { decodeJwt } from "../../utils/tokenUtils";

function RefLineModal({ setModalControl, refLine,setRefLine }) {
    const column = ['번호', '부서', '이름', '직급'];

    const loginToken = decodeJwt(window.localStorage.getItem("accessToken"));
    const dispatch = useDispatch();
    const memberList = useSelector(state => state.memberReducer);
    const [selectedMember, setSelectedMember] = useState({
        refMember: {
            memberNo: '', memberName: '',
            position: { positionName: '' },
            department: { depName: '' }
        }
    }) //선택된 사원 (추가 전)

    const [selectedRefList, setSelectedRefList] = useState([]); //추가된 참조선

    useEffect(() => {
        dispatch(callMembersAPI());
        console.log('refLine', refLine[0].refMember.memberNo)
        if(refLine[0].refMember.memberNo !== ''){
            setSelectedRefList(refLine);
        }
    }, [])

    const groupByDepartment = () => {
        const groupedMembers = {};
        Array.isArray(memberList) && memberList.map(member => {
            if (!groupedMembers[member.department.depName]) {
                groupedMembers[member.department.depName] = [];
            }
            groupedMembers[member.department.depName].push(member);
        });
        return groupedMembers;
    }; //부서별로그룹

    const onClickList = (member) => {
        setSelectedMember({
            refMember: member
        });
    }

    const onDoubleClickList = (member) => {
        if(!selectedRefList.find(item => item.refMember.memberNo === member.memberNo) && member.memberNo !== loginToken.memberNo){
            setSelectedRefList([
                ...selectedRefList,
                {
                    refMember: {
                        memberNo: member.memberNo,
                        memberName: member.memberName,
                        department: { depName: member.department.depName },
                        position: { positionName: member.position.positionName }
                    }
                }
            ]);
        }
    }

    const onClickAddButton = () => {
        if ( selectedMember.refMember.memberNo !== loginToken.memberNo &&
            selectedMember.refMember.memberNo !== '' &&
            !selectedRefList.find(item => item.refMember.memberNo === selectedMember.refMember.memberNo)) {
            setSelectedRefList([
                ...selectedRefList,
                {
                    refMember: {
                        memberNo: selectedMember.refMember.memberNo,
                        memberName: selectedMember.refMember.memberName,
                        department: { depName: selectedMember.refMember.department.depName },
                        position: { positionName: selectedMember.refMember.position.positionName }
                    }
                }
            ]);
        }
    }
    const onClickRmvButton = () => {
        console.log('dddddd', selectedRefList.length)
        if (selectedRefList.length > 0) {
            const removeList = [...selectedRefList];
            removeList.pop();
            setSelectedRefList(removeList);
        }
    }

    const onClickSubmit = () => {
        setRefLine(selectedRefList);
        setModalControl({ appLineModal: false, refLineModal: false });
    }

    return (
        <div className={AppModalCss.appModal}>
            <div className={AppModalCss.appModalBox}>
                <h1>참조선 추가</h1>
                <div className={AppModalCss.appModalContents}>
                    <div >
                        <h5>조직도</h5>
                        <div className={AppModalCss.members}>
                            <ul>
                                {Object.entries(groupByDepartment()).map(([department, members]) => (
                                    <li key={department}>
                                        <h5 style={{marginTop: '5px',marginBottom: '0px'}}>{department}</h5>
                                        <ul>
                                            {members.map((member, index) => (
                                                <li key={member.memberNo}
                                                    onClick={() => onClickList(member)}
                                                    onDoubleClick={() => onDoubleClickList(member)}
                                                    className={selectedMember.refMember.memberNo === member.memberNo ? AppModalCss.selectedLi : ''}
                                                >
                                                    {member.memberName}
                                                    &nbsp;
                                                    {member.position.positionName}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className={AppModalCss.btnDiv}>
                        <button onClick={() => onClickAddButton()}>추가</button>
                        <br></br>
                        <button onClick={() => onClickRmvButton()}>삭제</button>
                    </div>
                    <div >
                        <h5>참조자</h5>
                        <div className={AppModalCss.appMem}>
                            <table className={Style.appTable}>
                                <thead>
                                    <tr>
                                        {column.map((item) => (
                                            <th scope='col' key={item} style={{ width: '25%' }}>{item}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {!!selectedRefList && selectedRefList.map((item, index) => (
                                        <tr>
                                            <td>{index + 1}</td>
                                            <td>{item.refMember.department.depName}</td>
                                            <td>{item.refMember.memberName}</td>
                                            <td>{item.refMember.position.positionName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className={AppModalCss.appBtns}>
                    <button className="back-btn" onClick={() => setModalControl({ appLineModal: false, refLineModal: false })}>취소</button>
                    <button className="move-btn" onClick={onClickSubmit}>저장</button>
                </div>
            </div>
        </div>
    )
}
export default RefLineModal;
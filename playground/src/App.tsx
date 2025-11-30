import {clearGlobalABTestCache, getGlobalABTestUserstat, initGlobalABTest} from 'abtest-kit'

const userId = '12341';
clearGlobalABTestCache()
function prepareABTest() {
    // 定义全局分流配置
    const globalABTestConfig: Parameters<typeof initGlobalABTest>[0] = {
        f1: {
            key: 'f1',
            paramName: 'f1',
            groups: {
                0: 50, // 对照组 50%
                1: 50 // 实验组 50%
            },
            strategy: () => {
                return 1;
            }
        },
        // ! 注意：如果是0-9分桶，groups每组的流量需要被10整除
        f2: {
            key: 'f2',
            paramName: 'f2',
            groups: {
                0: 20, // 实验组
                1: 20, // 对照组
                2: 20,
                3: 20,
                4: 20
            }
        }
    };
    initGlobalABTest(globalABTestConfig, {
        strategy: groups => {
            // 获取userId最后一位数字
            const lastDigit = parseInt(userId.slice(-1), 10);

            // 确保lastDigit是有效的数字
            const normalizedDigit = isNaN(lastDigit) ? 0 : lastDigit;

            // 计算累计概率
            const groupEntries = Object.entries(groups);
            const totalGroups = groupEntries.length;

            // 根据最后一位数字平均分配到各个组
            // 0-9的数字均匀分布到不同的组中
            const selectedIndex = Math.floor((normalizedDigit / 10) * totalGroups);

            // 获取对应的groupId
            const groupId = parseInt(groupEntries[selectedIndex][0], 10);

            console.log(`User ID: ${userId}, Last digit: ${normalizedDigit}, Selected group: ${groupId}`);

            return groupId;
        }
    });
}
prepareABTest()
console.log(getGlobalABTestUserstat())

export default function App() {
  return (
    <div>看 console 控制台验证分流效果</div>
  )
}
